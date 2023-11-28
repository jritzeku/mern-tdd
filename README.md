<h1 align="center">medium-clone</h1>

## Description

 In this simple Goalify application, we demonstrate testing on client side and server side. There is surprisingly little resource online for complete/thorough testing tutorials for React and Node js. 

    ->For client side testing, I mainly referred to Basar Buyukkahraman's 
    React testing coures on udemy( https://www.udemy.com/course/). I feel that
    his course had the most coverage for various cases. The user related code is almost identical however I added additional features like ability to 
    add goals, view goals, edit goals, delete goals  and testing for those. 

    
    ->For server side testing, I mainly referred to these tutorials:
    https://www.freecodecamp.org/news/how-to-test-in-express-and-mongoose-apps/
    https://www.youtube.com/watch?v=r5L1XRZaCR0&t=870s
    https://www.youtube.com/watch?v=M44umyYPiuo&t=1448s



-Test results are save in folder 'TEST_RESULTS' at root folder via screenshots.

 
## How to run locally

1.  Create DB in MongoDB Atlas with following tables:

         ->users, goals 

2.  Create .env file in root folder containing following:

        MONGO_URI = (your mongodb connection string)

        JWT_KEY = (some string)

        PORT = 5001

        NODE_ENV= 'development'

 

3.  Install dependencies.

    > 'npm i' //in backend folder,

    > 'npm i' //in front end folder

 
 4. Run tests
     > 'npm run test' //in backend folder,

    > 'npm run test' //in front end folder


