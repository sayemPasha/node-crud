/*
1. carefull about the link: don't miss starting / (forward slash)
2. 200:ok, 400:bad request upon create/update body, 404:resource not found
*/
const express = require('express');
const app = express();
const Joi = require('@hapi/joi');

//enable json in express
app.use(express.json());
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

let courses = [
    {id:1, name:"cat"},
    {id:2, name: "dog"}
];

//init port
const port = process.env.PORT || 3000;
app.listen(port, ()=>{
    console.log(`listening to port ${port}`);
});

//read all entry
app.get('/api/courses', (request, response) => {
    console.log("served");
    response.send(courses);
});


//read single entry
app.get('/api/courses/:id', (request, response)=> {
    
    const course = courses.find(course=> course.id === parseInt(request.params.id));
    if(!course) return response.status(400).send("invalid id");

    response.send(course);

});

//create an entry
app.post('/api/courses/', (request,response) => {
    console.log("hit");
    const {error} = validateCourse(request.body); //destructuring
    if(error) return response.status(400).send(error.details[0]);

    const newEntry = {
        id : courses.length + 1, //FATAL ISSUE: if any entry is deleted, then length shortended, so again entry may overlap ID
        name: request.body.name
    };
    courses.push(newEntry);

    response.send(newEntry);
    
});

//update an entry
app.put('/api/courses/:id', (request, response) => {

    const course = courses.find(course=> course.id === parseInt(request.params.id));
    if(!course) return response.status(404).send("unknown id");

    const {error} = validateCourse(request.body);
    if(error) return response.status(400).send(error.details[0]);
    course.name = request.body.name;
    response.send(course);
});

//delete
app.delete('/api/courses/:id', (request, response) =>{
    const course = courses.find(course => course.id === parseInt(request.params.id));
    if(!course) return response.status(400).send("invalid id");

    //extract absolute index
    const courseIndex = courses.indexOf(course);
    courses.splice(courseIndex, 1);

    response.send(course);
    
});

function validateCourse(course){
    const schema = Joi.object({
        name: Joi.string().min(3).required() //this is a string and it has 3 characters and it is required
    });

    return schema.validate(course);
}
