nx = 100;
ny = 100;
nsim = 1000;
Rvec = 0:50;
twopi = 2*pi;

x = linspace(-170, 170, nx);
y = linspace(-170, 170, ny);
[X, Y] = meshgrid(x, y);
A = zeros(nx, ny, length(Rvec));

% Z = throw_dart(X, Y);
% figure, surf(X, Y, Z); view(2); colormap hot; colorbar; axis([-170 170 -170 170]); axis square

for count = 1:length(Rvec);
    R = Rvec(count);
    S = zeros(nx, ny);
    
    for n = 1:nsim
        if mod(n,100)==0, disp(n), end;
        r = rand(nx, ny) * R;
        theta = rand(nx, ny) * twopi;
        Xs = X + r*cos(theta);
        Ys = Y + r*sin(theta);
        S = S + throw_dart(Xs, Ys);
    end

    A(:,:,count) = S ./ nsim * 3;
end

save darts_ws