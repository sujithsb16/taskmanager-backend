const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const generateToken = require("../utility/generateToken");
const {Tasks} = require("../models");

const {Users} = require("../models");
const { where } = require("sequelize");



const registerUser = asyncHandler(async (req, res) => {
const user = req.body;
console.log(user);
    try {

         const userExist = await Users.findOne({ where: { email:user.email } });
         if (userExist) {
           res.status(400)
             throw new Error("Email already exists");
          
         } else {
           const salt = await bcrypt.genSaltSync(10);
           let hashPassword = await bcrypt.hash(user.password, salt);
           if (hashPassword) {

            user.password = hashPassword

             const newUser = await Users.create(user);

             if (newUser) {
               console.log(newUser.dataValues.id);
               res.json({
                 name: newUser.name,
                 email: newUser.email,
                 //  token: generateToken(newUser.dataValues.id),
               });
             }
           }
         }
        
    } catch (error) {
              console.log("trycatch error :", error.message);

    }

    
    // await User.create(user)

})

const loginUser = asyncHandler(async (req, res) => {
     try {
       const userData = req.body;
       const user = await Users.findOne({ where: { email:userData.email } });
        if (
          user &&
          (await bcrypt.compare(userData.password, user.dataValues.password))
        ) {
          res.json({
            name: user.dataValues.name,
            email: user.dataValues.email,
            token: generateToken(user.dataValues.id),
          });
        } else {
          if (!user) {
            res.json({
              message: "User does not exist!!!",
            });
          }
          res.json({
            message: "Password Incorrect!!!",
          });
        }
     } catch (error) {
       console.log("trycatch error :", error.message);
     }


})

const addTask = asyncHandler(async (req, res) => {
  const user = req.user;
  console.log(user);
  const taskData = req.body;

  try {
    const newTask = await Tasks.create({
      title: taskData.title,
      description: taskData.description,
      progress: 0,
      startDate: taskData.startDate,
      endDate: taskData.endDate,
      userId: user.id,
    });

    res.status(201).json(newTask);
  } catch (error) {
    console.log("trycatch error :", error.message);
    res.status(500).json({ message: "Server Error" });
  }
});

  
const getTask = asyncHandler(async (req, res) => {
  try {
    const user = req.user;
    const tasks = await Tasks.findAll({ where: { userId: user.id } });
    res.status(200).json(tasks);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

const deleteTask = asyncHandler(async (req, res) => {
  try {
    const taskId = req.params.id;
    const userId = req.user.id;

    const task = await Tasks.findOne({
      where: {
        id: taskId,
        userId: userId,
      },
    });

    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    await task.destroy();

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});


const updateTask = asyncHandler(async (req, res) => {
  try {
    console.log("update start");
    const taskId = req.params.id;
    const updatedTask = req.body;
        const userId = req.user.id;

        console.log(taskId);

    console.log(updatedTask);

    const task = await Tasks.findOne({
      where: {
        id: taskId,
        userId: userId,
      },
    });
console.log(task);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    if (updatedTask.progress == 100){
        task.title = updatedTask.title || task.title;
        task.description = updatedTask.description || task.description;
        task.progress = updatedTask.progress || task.progress;
        task.startDate = updatedTask.startDate || task.startDate;
        task.endDate = updatedTask.endDate || task.endDate;
        task.status = true;
    }else{
       task.title = updatedTask.title || task.title;
       task.description = updatedTask.description || task.description;
       task.progress = updatedTask.progress || task.progress;
       task.startDate = updatedTask.startDate || task.startDate;
       task.endDate = updatedTask.endDate || task.endDate;
task.status = false;
    }
     

    const updated = await task.save();

        const updatask = await Tasks.findOne({ _id: taskId, userId });
console.log(updatask);

    res
      .status(200)
      .json({ message: "Task updated successfully", task: updated });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});


const setRemainder = asyncHandler(async (req, res) => {
  try {
    console.log("start remainder");
    const taskId = req.params.id;
    const taskData = req.body;
    const userId = req.user.id;

    console.log(taskData);

    console.log(taskId);

    const task = await Tasks.findOne({
      where: {
        id: taskId,
        userId: userId,
      },
    });
    console.log(task);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    else {
      task.setRemainder = taskData.remainder

    }

    const updated = await task.save();

    const updatask = await Tasks.findOne({ _id: taskId, userId });
    console.log(updatask);

    res
      .status(200)
      .json({ message: "Task updated successfully", task: updated });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});

 


const pagination = asyncHandler(async (req, res) => {
  try {

     const user = req.user;
     const tasks = await Tasks.findAll({ where: { userId: user.id } });
     const page = parseInt(req.params.page)
     const limit = parseInt(req.params.limit)
     const  startIndex = (page-1)*limit
     const lastIndex = (page)*limit

     const results = {}

     results.totalTasks = tasks.length
     
     results.pageCount = Math.ceil(tasks.length/limit)

     if (lastIndex < tasks.length) {
       results.next = {
         page: page + 1,
       };
     }
    
     if(startIndex>0){
results.prev = {
  page: page - 1,
};
     }

     const pendingTasks = tasks?.filter((task) => !task.status);
      
     results.pendingTasks = pendingTasks.length

    results.result = tasks.slice(startIndex,lastIndex);
    res.status(200).json(results);


    
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Server Error" });
  }
});








module.exports = {
  registerUser,
  loginUser,
  addTask,
  getTask,
  deleteTask,
  updateTask,
  setRemainder,
  pagination,
};
