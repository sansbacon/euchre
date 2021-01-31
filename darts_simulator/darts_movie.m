load darts_ws
hfig = figure;

M = [0, 60, 20*ones(1,4), 35, 20*ones(1,4), 35, 6*ones(1,39), 35];
C = cumsum(M);

for i = 1:length(Rvec)
    R = Rvec(i);
    
    surf(X, Y, A(:,:,i)); view(2); shading interp; grid off; colormap jet; colorbar('fontsize', 13);
    axis([-170 170 -170 170]); axis square; 
    set(gca, 'xtick', 0, 'ytick', 0, 'fontsize', 13);
    title(['Radius of accuracy: ', num2str(R), 'mm'], 'fontsize', 15, 'fontweight', 'bold')

%     if i == 1
%         pause;
%     elseif R == 5 || R == 10
%         pause;
%     elseif R < 10
%         pause(1/3);
%     else
%         pause(0.05);
%     end
    
    for j = C(i)+1:C(i+1)
        F(j) = getframe(hfig);
    end
end

mpgwrite(F, jet, 'darts_simulator.mpeg')

% A = zeros(length(Rvec), 2);
% A(:,1) = 1:length(Rvec);
% for j = [1, 6, 11], A(j,2) = 15; end
% for j = [2, 3, 4, 5, 7, 8, 9, 10], A(j,2) = 5; end
% for j = 12:length(Rvec), A(j,2) = 2; end
% 
% frames = 1;
% for k = 1:length(Rvec)
%     frames = [frames A(k,1)*ones(1,A(k,2))];
% end
% 
% figure
% movie(gcf, F, frames, 10); % so play it at max(fps) fps but play earlier frames more often
% 
