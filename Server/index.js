const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mysql = require("mysql2");
const jwt = require("jsonwebtoken");
const Events = require("mysql-events");
require("dotenv").config();
//
const LocalStorage = require("node-localstorage").LocalStorage;
const localStorage = new LocalStorage("./scratch");
//
app.use(bodyParser.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
//
const connection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "dbhackathon",
    port: 3306,
});
connection.connect((err) => {
    if (err) {
        console.error("Lỗi kết nối cơ sở dữ liệu: ", err);
    } else {
        console.log("Kết nối cơ sở dữ liệu thành công");
    }
});
//
// lấy listUsers từ db
let listUsers = [];
const query = "SELECT * FROM users";
connection.query(query, (err, results) => {
    listUsers = results;
});
//Đăng nhập
app.post("/login", (req, res) => {
    console.log(req.body, "123321");
    let index = listUsers.findIndex((item) => {
        return (
            item.userName == req.body.userName &&
            item.password == req.body.password
        );
    });
    let user = listUsers[index];
    if (user != undefined) {
        const payload = {
            userId: user.userId,
            userName: user.userName,
            role: user.role,
        };
        const token = jwt.sign(payload, process.env.ACCESS_TOKEN, {
            expiresIn: "30m",
        });
        if (user.role == 0) {
            res.status(200).json({
                message: `Chào mừng ngài quản lý ${user.userName}`,
                token,
            });
            localStorage.setItem("token", token);
            // console.log(token,"dòng 70");
        } else {
            res.status(200).json({
                message: `Chào mừng người dùng ${user.userName}`,
                token,
            });
            localStorage.setItem("token", token);
        }
    } else {
        console.log("Sai");
        return res.status(400).json({ message: "Đăng nhập không thành công" });
    }
});
//
//middleware kiểm tra xem người dùng đăng nhập chưa để Read
function middlewareToken(req, res, next) {
    const token = req.headers.authorization;

    // console.log(token, "vvvv");
    if (!token) {
        return res.status(401).json({ message: "Chưa xác thực" });
    } else {
        let requestToken = token.split(" ")[1];
        let resultToken = jwt.verify(
            requestToken,
            process.env.ACCESS_TOKEN,
            (err, data) => {
                /* nếu gửi đúng token thì err là null
                nếu gửi sai thì err khác null
            */
                if (err) {
                    return res.status(403).json({ message: "Ko có quyền" });
                } else {
                    next();
                }
            }
        );
    }
}
//
app.get("/todo", middlewareToken, (req, res) => {
    // lấy todoList từ db
    const query2 = "SELECT * FROM todolist";
    connection.query(query2, (err, results2) => {
         res.status(200).json({
             data: results2,
         });
    });
    
});
//middleware kiểm tra role để có thể CRUD ko hay chỉ Read
function middlewareToken2(req, res, next) {
    const token = req.headers.authorization;
    if (!token) {
        return res.status(401).json({ message: "Chưa xác thực" });
    } else {
        let requestToken = token.split(" ")[1];
        jwt.verify(requestToken, process.env.ACCESS_TOKEN, (err, data) => {
            if (err) {
                return res.status(403).json({ message: "Ko có quyền" });
            } else {
                const role = data.role;

                if (role == "admin") {
                    next();
                } else if (role == 1) {
                    return res
                        .status(403)
                        .json({ message: "Bạn không có quyền" });
                } else {
                    return res
                        .status(403)
                        .json({ message: "Vai trò không hợp lệ" });
                }
            }
        });
    }
}
//Thêm
app.post("/todo",middlewareToken2, async(req, res) => {
    
    try {
        console.log(req.body, "vvv");
        const { taskName, Detail, Status } = req.body;
        const query = `INSERT INTO todolist (id, taskName, Detail, Status) VALUES (NULL, ?, ?, ?)`;
        const values = [taskName, Detail, Status];

        const insertResult = await new Promise((resolve, reject) => {
            connection.query(query, values, (err, results) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
        const selectQuery = "SELECT * FROM todolist";
        const updatedResults = await new Promise((resolve, reject) => {
            connection.query(selectQuery, (err, results) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
        const listTasks = updatedResults;
        res.status(200).json(listTasks);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: "Ko thêm đc",
        });
    }
    
})
//Xóa
app.delete("/todo/:id", middlewareToken2, async (req, res) => {
    try {
        const { id } = req.params;
        const query = "DELETE FROM todolist WHERE id = ?";
        const values = [id];

        await new Promise((resolve, reject) => {
            connection.query(query, values, (err, results) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        const selectQuery = "SELECT * FROM todolist";
        const updatedResults = await new Promise((resolve, reject) => {
            connection.query(selectQuery, (err, results) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        const listTasks = updatedResults;
        res.status(200).json(listTasks);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: "Ko xóa đc bên db",
        });
    }
});

//
//PUT
app.put("/todo/:id", middlewareToken2, async (req, res) => {
    try {
        const { id } = req.params;
        const { taskName } = req.body;

        const query = "UPDATE todolist SET taskName = ? WHERE id = ?";
        const values = [taskName, id];

        await new Promise((resolve, reject) => {
            connection.query(query, values, (err, results) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        const selectQuery = "SELECT * FROM todolist";
        const updatedResults = await new Promise((resolve, reject) => {
            connection.query(selectQuery, (err, results) => {
                if (err) {
                    console.log(err);
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });

        const listTasks = updatedResults;
        res.status(200).json(listTasks);
    } catch (error) {
        console.log(error);
        res.status(500).json({
            error: "Lỗi cập nhật",
        });
    }
});
//
app.listen(3000, (req, res) => {
    console.log("Server đang chạy ngon");
});
