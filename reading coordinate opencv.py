import cv2
import numpy as np
import pandas as pd
import math
import matplotlib.pyplot as plt

# Open the video
cap = cv2.VideoCapture('video-4.mp4')
x_c = []
y_c = []
r_p = []
theta_p = []
circles_all = []
i = 0

while True:
    success, new_frame = cap.read()
    # Take each frame
    if success:
        i += 1
        frame = new_frame
        crop_img = frame[200:2000, 600:2500].copy()
        gray = cv2.cvtColor(crop_img, cv2.COLOR_BGR2GRAY)
        circles = cv2.HoughCircles(gray, cv2.HOUGH_GRADIENT, dp=1.5, minDist=505, param1=75, param2=30, minRadius=8,maxRadius=30)
        # ensure at least some circles were found
        if circles is not None:
            # convert the (x, y) coordinates and radius of the circles to integers
            circles = np.round(circles[0, :]).astype("int")
            # loop over the (x, y) coordinates and radius of the circles
            for x, y, r in circles:
                print(x, y)
                x_c.append(x)
                y_c.append(-y)
                ra = math.sqrt(math.pow(x,2)+math.pow(-y,2))
                t = math.atan(-y/x)
                r_p.append(ra)
                theta_p.append(t)

                circles_all.append([x, y, r])
                # draw the circle in the output image, then draw a rectangle
                # corresponding to the center of the circle
                cv2.circle(crop_img, (x, y), r, (0, 255, 0), 4)
                cv2.rectangle(crop_img, (x - 5, y - 5),
                              (x + 5, y + 5), (0, 128, 255), -1)

        cv2.imshow('hi', crop_img)
        cv2.waitKey(0)
    else:
        crop_img = frame[200:2000, 600:2500].copy()
        for (x, y, r) in circles_all:
            # draw the circle in the output image, then draw a rectangle
            # corresponding to the center of the circle
            cv2.circle(crop_img, (x, y), 7, (255, 0, 0), -1)
            #cv2.rectangle(crop_img, (x - 5, y - 5),(x + 5, y + 5), (0, 128, 255), -1)
        
        cv2.imwrite('lastframe.jpg', crop_img)
        break

print("Number of captured frames: ", i)
print("The length of list is: ", len(circles_all)) 
cv2.destroyAllWindows()
df = pd.DataFrame({ "x" : np.array(x_c), "y" : np.array(y_c), "r" : np.array(r_p), "theta" : np.array(theta_p)})
df.to_csv("coordinates.csv", index=False)

plt.axes(projection='polar')
for rad, thet in zip(r_p, theta_p): 
    plt.polar(thet, rad, 'r.') 
plt.show()