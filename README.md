# Authentication Learning Journey Memorial 🚀

Welcome to the Authentication Learning Stages Memorial repository! 🎓 Here, you'll find a collection of insights and discoveries as I navigated the intriguing world of user authentication. Each step in this journey is a testament to growth and learning.

## Key Learnings:

### i. User Registration and Dashboards 💻

Embrace the power of user registration! Instead of laying every piece of information open, let's guide users into their personalized dashboards. It might sound primitive, but it's a fundamental step in crafting a secure and tailored user experience.

### ii. Encryption Magic with Mongoose-Encryption 🔐

Enter the realm of encryption and decryption with the enchanting mongoose-encryption. Witness the magic happening in real-time:

   a. **Data Entry:** Safeguard your data by encrypting it seamlessly before storing it in the database.
   
   b. **Login Matchmaking:** When the time comes to login or other authentication purposes, decrypt the specified data in an unseamable way. It's like a secret handshake between your application and security.

### iii. .env and .gitignore 🌐

Elevate your security game with the .env file and the dance of .gitignore. It's the extended version of our encryption journey:

   - Store sensitive information in a secure .env file, shielded from prying eyes.
   
   - Dance with .gitignore to ensure that these secrets stay locked within the confines of your development space.

### iv. HASHING with md5 🌐

Elevate your security game with the hashing:

   - Store sensitive information in a hash format.
   
   - But the hash is still easily accessable to the hackers, as it is without any salting.

### v. HASHING with bcrypt or bcryptjs (here i have followed bcryptjs) 🌐

Elevate your security game with the salted hashing:

   - Store sensitive information in a hash format with amalgamated salt.

   - You can salt your data as many times as you want with the same salt generated once. 

   - Thus the store data is not so easy to access by the hackers. 

   - The most reliable way while dealing with your sensitive data
