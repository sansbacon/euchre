function score = throw_dart(X, Y)

[theta, r] = cart2pol(X, Y);

% if r >= 170
%     score = 0;
% elseif r < 6.35
%     score = 50;
% elseif r < 15.9
%     score = 25;
% else
%     numorder = [13,4,18,1,20,5,12,9,14,11,8,16,7,19,3,17,2,15,10,6];
%     segment = numorder(ceil(mod(10/pi*(theta-pi/20), 20)));
%     if r < 107 & r >= 99
%         score = 3*segment;
%     elseif r < 170 & r >= 162
%         score = 2*segment;
%     else
%         score = segment;
%     end
% end

numorder = [13,4,18,1,20,5,12,9,14,11,8,16,7,19,3,17,2,15,10,6];
segment = numorder(ceil(mod(10/pi*(theta-pi/20), 20)));
   
S1 = (r < 6.35) .* 50 + (r >= 6.35 & r < 15.9) .* 25;
S2 = (r < 107 & r >= 99) .* 3 .* segment + (r < 170 & r >= 162) .* 2 .* segment + (r >= 15.9 & r < 99 | r >= 107 & r < 162) .* segment;
score=S1+S2;
