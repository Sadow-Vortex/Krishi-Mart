# Welcome to Kishan Seva app 👋

This is an [Expo](https://expo.dev) project created with [`create-expo-app`](https://www.npmjs.com/package/create-expo-app).

## Get started

1. Install dependencies

   ```bash
   npm install
   ```

2. Start the app

   ```bash
   npx expo start
   ```

In the output, you'll find options to open the app in a

- [development build](https://docs.expo.dev/develop/development-builds/introduction/)
- [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
- [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
- [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

You can start developing by editing the files inside the **app** directory. This project uses [file-based routing](https://docs.expo.dev/router/introduction).

## Get a fresh project

When you're ready, run:

```bash
npm run reset-project
```

This command will move the starter code to the **app-example** directory and create a blank **app** directory where you can start developing.

## Learn more

To learn more about developing your project with Expo, look at the following resources:

- [Expo documentation](https://docs.expo.dev/): Learn fundamentals, or go into advanced topics with our [guides](https://docs.expo.dev/guides).
- [Learn Expo tutorial](https://docs.expo.dev/tutorial/introduction/): Follow a step-by-step tutorial where you'll create a project that runs on Android, iOS, and the web.

## Join the community

Join our community of developers creating universal apps.

- [Expo on GitHub](https://github.com/expo/expo): View our open source platform and contribute.
- [Discord community](https://chat.expo.dev): Chat with Expo users and ask questions.

- 
# 📱What you can see

This is a **full-stack mobile application** for farmers to post, browse, and manage agricultural advertisements.  
The frontend is built with **React Native (Expo)** and the backend is a **Spring Boot** REST API.

---

## 🛠️ Project Structure

### 🖥️ Backend (Spring Boot)
Located in `/src/main/java/com/begin/advertisement/`:

- `Advertisement.java`: Entity for ad posts  
- `Location.java`: Embedded class for coordinates (lat/lng)  
- `AdvertisementController.java`: REST API controller  
- `AdvertisementService.java`: Business logic  
- `AdvertisementRepository.java`: JPA repository  
- `ApiResponse.java`: Standard API response structure  
- `WebConfig.java`: Enables serving uploaded files  
- `AdvertisementApplication.java`: Main class  

### 📱 Frontend (React Native - Expo)
Key screens:

- `Advertisement.js`: Post new ad  
- `EditProfile.js`: Edit profile  
- `UserProfile.js`: View/update profile pictures  
- `HomeScreen.js`: Home with categories, popular & recent ads  
- `AdsBySubCategory.js`: Browse ads by subcategory  
- `SignUp.js`: Register new users  
- `MyAds.js`: View user-posted ads  
- `UpdateAdvertisement.js`: Update existing ads  
- `SubCategory.js`: Display subcategories under selected category  

---

## 🚀 App Features

### 🧑‍🌾 Profile Management
- View/update profile and cover pictures
- Edit name, phone, and password
- Upload image from device

### 🛒 Advertisement
- Create, update, delete ads (title, description, price, image, location)
- Pick location from map
- Choose categories and subcategories
- View own ads list

### 🏠 HomeScreen
- Auto-sliding banners
- Category horizontal scroll
- Trending and newly posted items
- Modal popup on ad tap with contact/map options

---

## 📦 API Endpoints

| Method | Endpoint                               | Description                         |
|--------|----------------------------------------|-------------------------------------|
| GET    | `/adv`                                 | Get all advertisements              |
| GET    | `/adv/{id}?viewerId={userId}`          | Get ad and increment view count     |
| GET    | `/adv/userID/{userId}`                 | Get ads by specific user            |
| GET    | `/adv/subCategory/{subCategoryId}`     | Ads filtered by subcategory         |
| PUT    | `/adv/{adv_id}`                        | Update advertisement                |
| DELETE | `/adv/{adv_id}`                        | Delete advertisement                |
| POST   | `/adv`                                 | Post a new advertisement            |
| POST   | `/adv/upload`                          | Upload ad image                     |
| GET    | `/users`                               | Get all users                       |
| PUT    | `/users/{id}`                          | Update user profile                 |
| POST   | `/users/upload`                        | Upload profile/cover image          |

---

## 🔗 Backend URLs Used

- User Auth: `http://10.0.167.11:1012/users`
- Advertisement API: `http://10.0.167.11:2012/adv`
- Category/Subcategory API: `http://10.0.167.11:2001/api/subcategories`

---

## ⚙️ Setup Instructions

### ✅ Backend
- Java 17+
- Spring Boot 3.x
- Add this to `application.properties`:
```properties
spring.servlet.multipart.max-file-size=5MB
spring.servlet.multipart.max-request-size=5MB
```

### ✅ Frontend
```bash
npm install
expo install expo-image-picker expo-location
npm install axios react-native-picker-select
```

To run the app:
```bash
npx expo start
```

---

## 🧪 Sample API Responses

### ✅ `/users`
```json
{
  "status_code": 200,
  "status_msg": "Success",
  "data": [
    {
      "id": 1,
      "name": "user",
      "profilePic": "http://<ip>/uploads/...jpg"
    }
  ]
}
```

### ✅ `/adv`
```json
{
  "adv_id": 1,
  "advUserID": 1,
  "adv_Title": "Wheat",
  "adv_Price": 23,
  "adv_Address": "Bhubaneswar",
  "count": 5
}
```

---

## 📃 License

This project is for educational/demo purposes only. All rights reserved by the developer.

---

## ✨ Author

Made with ❤️ by **Rushi Prasad Manna**

