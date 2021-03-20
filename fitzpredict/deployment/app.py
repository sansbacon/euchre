import numpy as np
import pandas as pd
pd.set_option('mode.chained_assignment', None)
from flask import Flask, request, jsonify, render_template
import re
from bs4 import BeautifulSoup
from urllib.request import urlopen
import os

def get_soup(url):
    """Imports URL as beautifulsoup object
    """
    try:
        page = urlopen(url)
        html = page.read().decode("utf-8")
        soup = BeautifulSoup(html, "lxml")# "html.parser")
        return soup
    except:
        return None

def score_breakdown(score):

    if re.search('^\d+(/\d+)?d?$', score) is None:
        raise ValueError('Invalid score format')

    if score.endswith('d'):
        declared = True
        score = score[:-1]
    else:
        declared = False

    if score.count('/') == 0:
        score = score + '/10'

    li = [int(x) for x in score.split('/')]

    if declared or li[1] >= 10:
        is_complete = 1
    else:
        is_complete = 0

    return li + [is_complete]

def add_match_innings(score_df):
    score_df.loc[(score_df['team_pos'] == 1) & (score_df['team_innings'] == 1), 'match_innings'] = 1
    score_df.loc[(score_df['team_pos'] == 2) & (score_df['team_innings'] == 1), 'match_innings'] = 2
    score_df.loc[(not any(score_df['follow_on'])) & (score_df['team_pos'] == 1) & (score_df['team_innings'] == 2), 'match_innings'] = 3
    score_df.loc[(any(score_df['follow_on'])) & (score_df['team_pos'] == 2) & (score_df['team_innings'] == 2), 'match_innings'] = 3
    score_df.loc[(not any(score_df['follow_on'])) & (score_df['team_pos'] == 2) & (score_df['team_innings'] == 2), 'match_innings'] = 4
    score_df.loc[(any(score_df['follow_on'])) & (score_df['team_pos'] == 1) & (score_df['team_innings'] == 2), 'match_innings'] = 4
    score_df['match_innings'] = score_df['match_innings'].astype(int)

    return score_df

def get_situation(score_df, team_names):

    active_row = score_df.loc[score_df['match_innings'] == score_df['match_innings'].max()]
    batting_team = active_row.loc[:, 'team'].iloc[0]
    bowling_team = list(set(team_names) - set([batting_team]))[0]
    wickets = active_row.loc[:, 'wickets'].iloc[0]
    innings = active_row.loc[:, 'match_innings'].iloc[0]
    runs_diff = score_df.loc[score_df['team'] == batting_team, 'runs'].sum() - score_df.loc[~(score_df['team'] == batting_team), 'runs'].sum()

    active_dict = {'batting_team': batting_team,
                  'bowling_team': bowling_team,
                  'innings': innings,
                  'wickets': wickets,
                  'runs_diff': runs_diff}

    return active_dict

def extract_scores(soup_teams):

    score_df = pd.DataFrame(columns=['team', 'team_pos', 'team_innings', 'follow_on', 'runs', 'wickets', 'is_completed'])
    team_pos = 0
    score_str = {1: '', 2: ''}
    team_names = []

    for t in soup_teams:
        team = t.find("p", {"class": "name"}).string
        team_names.append(team)
        team_pos += 1
        score_str[team_pos] = team
        team_innings = 0

        for s in t.findAll("span", {"class": "score"}):
            team_fo = '(f/o)' in s.string
            score_str[team_pos] += ' ' + s.string

            for score in s.string.replace('(f/o) ', '').split(' & '):
                team_innings += 1
                follow_on = team_fo & (team_innings == 2)
                score_list = score_breakdown(score)
                runs = score_list[0]
                wickets = score_list[1]
                is_completed = score_list[2]

                score_df = score_df.append({'team': team,
                                      'team_pos': team_pos,
                                      'team_innings': team_innings,
                                      'follow_on': follow_on,
                                      'runs': runs,
                                      'wickets': wickets,
                                      'is_completed': is_completed},
                                         ignore_index=True)

    score_df = add_match_innings(score_df)
    situation = get_situation(score_df, team_names)

    return situation, score_str

def sanitise_scorecard(url):
    return '/'.join(re.split('/', url)[:-1]) + '/live-cricket-score'

def get_match(url):

    if not url.startswith('https://www.espncricinfo.com/'):
        return False, 'URL domain is not https://www.espncricinfo.com/'

    try:
        soup = get_soup(sanitise_scorecard(url))
        match = soup.find("div", {"class": "match-info match-info-MATCH"})
    except:
        return False, "This doesn't look like a Cricinfo scorecard."

    if 'Test' not in match.find("div", {"class": "description"}).string:
        return False, 'This match is not a Test.'
    elif match.find("div", {"class": "status"}).string == 'result':
        return False, 'This match is completed.'
    else:
        return True, match

def parse_scorecard(match):

    teams = match.find("div", {"class": "teams"}).findAll("div", {"class": "team"})
    situation, score_str = extract_scores(teams)

    return situation, score_str

def predict(model_df, situation, added_runs=0, added_wickets=0):

    situation_new = situation
    situation_new['runs_diff'] += added_runs
    situation_new['wickets'] += added_wickets
    if situation_new['wickets'] >= 10:
        situation_new['wickets'] = 9

    innings = situation_new['innings']
    wickets = situation_new['wickets']
    runs_diff = situation_new['runs_diff']

    state_df = model_df.loc[(model_df['innings'] == innings) & (model_df['wickets'] == wickets)]

    if len(state_df) == 0:
        raise ValueError

    runs_df = state_df.loc[state_df['runs_diff'] == runs_diff, 'pred_win_pct']

    if len(runs_df) > 0:
        return runs_df.iloc[0]
    else:
        return state_df.iloc[(state_df['runs_diff'] - runs_diff).abs().argsort()].iloc[0]['pred_win_pct']

def get_model_df(model_file):
    return pd.read_csv('model.csv')

app = Flask(__name__)
THIS_FOLDER = os.path.dirname(os.path.abspath(__file__))
model = os.path.join(THIS_FOLDER, 'model.pkl')

@app.route('/')
def home():
    return render_template('index.html')

@app.route('/predict',methods=['POST'])
def run_prediction():

    model_df = get_model_df(model)

    features =  [x for x in request.form.values()]
    url = features[0]
    is_valid, match = get_match(url)

    if not is_valid:
        # Error
        url_value = ''
        error_text = match
        summary_header = ''
        summary_team1 = ''
        summary_team2 = ''
        prediction_header = ''
        prediction_text = ''
        prediction_team1 = ''
        prediction_team2 = ''
    else:
        # Valid
        situation, score_str = parse_scorecard(match)
        batting_pred_win_pct = predict(model_df, situation)

        url_value = url
        error_text = ''
        summary_header = 'Scorecard'
        summary_team1 = score_str[1]
        summary_team2 = score_str[2]
        prediction_header = 'Prediction'
        prediction_text = 'If the match is played to a result, the chances of each team winning are:'
        prediction_team1 = situation['batting_team'] + " {:.1%}".format(batting_pred_win_pct)
        prediction_team2 = situation['bowling_team'] + " {:.1%}".format(1- batting_pred_win_pct)

    return render_template('index.html',
                           url_value = url_value,
                           error_text = error_text,
                           summary_header = summary_header,
                           summary_team1 = summary_team1,
                           summary_team2 = summary_team2,
                           prediction_header = prediction_header,
                           prediction_text = prediction_text,
                           prediction_team1 = prediction_team1,
                           prediction_team2 = prediction_team2
                           )

@app.route('/results',methods=['POST'])
def results():

    data = request.get_json(force=True)
    #prediction = model.predict([np.array(list(data.values()))])
    data_values = list(data.values())
    prediction_text = forecast_output(data_values[0], model)

    #output = prediction[0]
    #return jsonify(output)
    return jsonify(prediction_text)

if __name__ == "__main__":
    app.run(debug=True)