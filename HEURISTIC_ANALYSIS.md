# Heuristic Analysis and Interface Evaluation

## Project Context

SportsAI Coach is an AI-supported fitness application with facial recognition, exercise recognition, repetition counting, score tracking, level progression, and predefined workout plans. The interface was evaluated with a focus on usability, gesture interaction, facial login, feedback quality, error prevention, personalization, and clarity during a workout session.

The current version supports manual exercise selection and predefined training plans. During registration, users choose their current fitness level from four levels. After login, the app shows three ready-made training plans for the user's fitness level and adjusts them by age group.

## Evaluation Method

The interface was reviewed using common usability heuristics, especially Nielsen's usability principles, and gesture-specific criteria for camera-based interaction. The review focuses on whether users can understand the system state, recover from mistakes, and complete the main flow without technical knowledge.

Main user flow reviewed:

1. Register a profile with name, age, gender, current fitness level, and three face samples.
2. Capture three face samples manually: front, slight left, and slight right.
3. Sign in using facial recognition.
4. View personal profile information.
5. Select an exercise manually or choose one of the predefined training plans.
6. Start a set.
7. Perform the exercise while receiving visual and text feedback.
8. Complete repetitions, gain score, and progress toward the next level.

## Visibility of System Status

The application keeps users informed about what is happening at each step. During registration, the interface shows the face sample progress, for example 0/3, 1/3, 2/3, and 3/3. It also tells the user which face angle should be captured next: front, slight left, or slight right.

During login, the app shows whether a registered face has been detected and whether the user can sign in. After login, the workout panel shows the selected exercise, current repetitions, target repetitions, current level, completed sets, and progress toward the next level.

The live camera overlay helps users understand what the system can see. During login, the overlay focuses on face recognition. During training, it focuses on exercise tracking so users are not distracted by developer information.

Evaluation: Visibility of system status is strong. Users can see what step they are in, whether enough face samples have been captured, whether a set is running, and how close they are to completing the target.

## Match Between System and Real-World Use

The UI uses fitness-related language such as set, reps, level, score, fitness level, exercise, and training plan. These terms match how users understand workouts.

The registration flow also uses real-world instructions. Instead of silently collecting face data, the app asks the user to capture three clear angles of the same face. This is easier to understand and also improves recognition quality because the system receives more varied face samples.

For Hand Curling, the app gives concrete form feedback, especially about elbow position. This is important because the exercise is not only counted, but also evaluated for whether the movement matches the selected exercise.

Evaluation: The interface mostly uses natural fitness language. The assignment calls the exercise "Hand Weight Lifting", while the app uses "Hand Curling". This can be explained in the presentation as the implemented hand weight lifting movement, focused on controlled elbow position.

## User Control and Freedom

Users control the registration process themselves. The app no longer captures face samples automatically. The user must press the capture button three times, once for each angle. This gives users control over when their face sample is saved.

Users also control their workout path. They can either select an exercise manually or use one of the predefined training plans. The app allows a custom repetition target while also providing automatic level-based and plan-based targets.

Evaluation: User control is strong. Users decide when to capture face samples, when to start a set, which exercise to perform, and whether to follow a training plan.

## Consistency and Standards

The interface uses consistent controls for repeated tasks:

- Dropdowns for language, gender, fitness level, and exercise selection.
- Buttons for clear actions such as capture sample, register profile, start set, start plan, and next exercise.
- Compact metric rows for level, sets, score, and progress information.
- Consistent feedback boxes for status and guidance messages.

The login flow is also consistent with the number of recognized users. If only one registered face is recognized, the app does not force unnecessary profile selection. If multiple users are recognized, the app asks which user should sign in.

Evaluation: The app follows consistent interaction patterns and reduces unnecessary steps.

## Error Prevention

The app prevents several common user errors:

- A user cannot register until three face samples are captured.
- Face samples are captured only when the user clicks the capture button.
- The face sample counter is limited to 3/3, so confusing values like 5/3 cannot appear.
- A user cannot start a workout before signing in.
- A custom repetition target must be a whole number between 1 and 100.
- Repetition counting starts only after the user presses "Start set".
- If the detected movement does not match the selected exercise, the app warns the user instead of counting the wrong activity.
- During registration, only one face should be visible.

Evaluation: Error prevention is strong because the app blocks invalid actions before they create bad data. The explicit three-sample registration flow is especially important for facial recognition quality.

## Recognition, Not Recall

The user does not need to remember available exercises or training plans. Exercises are shown in a dropdown, supported by an example image and a short rule for the selected exercise.

Training plans are shown as selectable cards. Each card lists the exercises and repetition targets, so the user can understand the plan before starting it. The app also shows the next exercise after a completed plan step.

Evaluation: The app reduces memory load. Users can choose from visible options instead of remembering commands or hidden workflows.

## Flexibility and Efficiency of Use

The application supports different user types:

- Beginners can follow predefined plans.
- More confident users can choose exercises manually.
- A trainer or advanced user can set a custom repetition target.
- The selected fitness level influences the available plans.
- Age groups adjust the plan difficulty.

The four fitness levels are:

- Beginner
- Active
- Fit
- Athlete

Each fitness level has three predefined training plans. This gives the app a clearer structure and supports the assignment requirement for personalization and difficulty levels.

Evaluation: Flexibility is strong. The system supports both guided and manual use.

## Aesthetic and Minimalist Design

Developer-focused information was removed from the main user interface. After login, the interface focuses on the camera, exercise selection, plan selection, current target, level progress, and feedback.

The exercise preview is placed near the camera view, so users can compare the example movement with their own body position without scrolling. The registration view now shows only the information needed to create a profile and capture face samples.

Evaluation: The interface is cleaner and more appropriate for end users. It avoids unnecessary technical data and supports the main fitness task directly.

## Help Users Recognize, Diagnose, and Recover From Errors

The app gives short, action-oriented feedback messages when something is wrong or incomplete. Examples include:

- No face is visible.
- Only one face should be visible during registration.
- Move closer to the camera before saving this face sample.
- Capture 3 face samples before registering.
- No registered face recognized yet.
- Sign in before starting a workout.
- Target must be a whole number from 1 to 100.
- That movement does not match the selected exercise.
- No repetition counted yet.

These messages describe the problem and usually tell the user what to do next.

Evaluation: Error recovery is strong because users receive clear guidance instead of technical errors.

## Help and Documentation

The app includes direct in-context guidance. During registration, the app explains that three face angles should be captured. During workouts, each exercise has a rule and the workout panel gives live feedback during the set.

For the final presentation, a short demo guide should still explain the expected flow: register, capture three face samples, login, choose fitness level, start a plan, perform exercises, and observe level progress.

Evaluation: In-app help is good. A demo guide in the presentation will make the workflow even clearer for assessment.

## Gesture Interaction Evaluation

The gesture and pose interaction is appropriate for the fitness scenario because the camera input is directly connected to the workout task. Repetitions are counted only after a set is started. This prevents unrelated movement from being treated as valid progress.

The system gives form-related feedback. For Hand Curling, it checks whether the elbow stays near the body and does not count unrelated arm positions as correct curling. For other exercises, the app uses clear movement states such as up and down to determine repetitions.

Evaluation: Gesture interaction is functional and task-specific. The most important usability recommendation is to keep the full body visible, use good lighting, and stand far enough from the camera during the demo.

## Facial Recognition Evaluation

Facial recognition supports personalization by identifying the user after registration. The profile information, fitness level, level, score, login count, and completed sets are linked to the recognized user.

The registration flow improves recognition quality by saving three manually captured samples of the same face from different angles: front, slight left, and slight right. This makes the dataset more useful than a single face image and gives the user clear control over what is saved.

The login flow is simplified: when only one user is recognized, no unnecessary selection is shown. If multiple users are present, the system asks the user to choose the correct profile.

Evaluation: Facial recognition is used meaningfully. It controls access to the personalized training area and loads the correct progress and training plan data.

## Customization Evaluation

The application supports customization through:

- User profile data: name, age, gender.
- Current fitness level at registration.
- Age-group-based workout adjustment.
- Three training plans per fitness level.
- Exercise choice.
- Automatic level-based targets.
- Optional custom repetition target.
- Persistent score, level, login count, and completed sets.
- Language switching across all supported languages.

Evaluation: Customization is strong and directly supports the assignment goal of a personalized fitness experience.

## Language and Internationalization Evaluation

The application supports multiple languages. Previously, some language values displayed question marks because translation strings were incomplete or broken. This was corrected so the interface no longer shows placeholder question marks in translated UI values.

Evaluation: This improves release quality. A user should see readable labels and messages instead of unfinished placeholders.

## Overall Findings

The application meets the main usability expectations for a gesture- and facial-recognition fitness app. It gives visible feedback, prevents common mistakes, supports manual and plan-based exercise selection, provides rules, tracks repetitions, stores user progress, and increases challenge through levels.

Main strengths:

- Clear login and registration flow.
- Manual three-sample face registration from different angles.
- Clean workout interface after login.
- Fitness-level selection with four levels.
- Three predefined training plans per fitness level.
- Age-group adjustment for training plans.
- Exercise-specific guidance and example images.
- Repetition counting starts only after the user starts a set.
- Level, score, and progress make the experience feel more game-like.
- Messages are user-friendly and action-oriented.
- Multilingual UI no longer contains question-mark placeholders.

Remaining improvement opportunities:

- Add a short demo guide to the README or presentation.
- Explain in the presentation that Hand Curling is the implemented hand weight lifting exercise.
- Recommend good lighting, enough distance from the camera, and full-body visibility for reliable recognition.
- In a future version, store long-term plan completion history separately from total completed sets.

## Conclusion

SportsAI Coach provides an appropriate and user-friendly interface for the assignment. The design supports facial recognition for personalized login, gesture recognition for exercise tracking, predefined workout plans for guided training, and game-like progression through score and levels. The interface gives clear feedback, avoids unnecessary developer information, and helps the user understand what to do before, during, and after each set.
