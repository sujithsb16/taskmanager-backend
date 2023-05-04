const express = require("express");
const { registerUser, loginUser, addTask, getTask, deleteTask, updateTask, setRemainder, pagination } = require("../controller/userController");
const protect = require("../middleware/authMiddleware");

const router = express.Router()



router.route("/register").post(registerUser);
router.route("/login").post(loginUser);
router.route("/addtask").post(protect, addTask);
router.route("/gettask").get(protect, getTask);
router.route("/deletetask/:id").get(protect, deleteTask);
router.route("/updatetask/:id").put(protect, updateTask);
router.route("/setremainder/:id").put(protect, setRemainder);
router.route("/tasks/:page/:limit").get(protect, pagination);







module.exports = router;
