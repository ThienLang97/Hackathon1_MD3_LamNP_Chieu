import React, { useState } from "react";
import "./Login.scss";
import axios from "axios";
import { useNavigate } from "react-router-dom";
export default function Login() {
    let [user, setUser] = useState({
        userName: "",
        password: "",
    });
    const handleSubmit = (e) => {
        e.preventDefault();
    };
    const direct = useNavigate();
    const handleChange = (e) => {
        let userName = e.target.name;
        let value = e.target.value;
        setUser({ ...user, [userName]: value });
        // console.log(user);
    };
    const handleLogin = async (e) => {
        console.log(user, "ádfg");

         try {
             const response = await axios.post(
                 "http://localhost:3000/login",
                 user
             );
             const { token } = response.data;

             // Lưu trữ token trong localStorage
             localStorage.setItem("token", token);

             alert("Đăng nhập thành công");
             direct("/todo");
         } catch (error) {
             alert("Đăng nhập không thành công");
         }
    };
    return (
        <div className="bodyLog">
            <div className="login">
                <div className="log-container">
                    <p>Đăng nhập</p>
                    <form action="" onSubmit={handleSubmit}>
                        <input
                            type="text"
                            placeholder="Tên đăng nhập"
                            style={{ paddingLeft: 10 }}
                            className="nameInput"
                            name="userName"
                            onChange={handleChange}
                        />
                        <input
                            type="password"
                            placeholder="Mật khẩu"
                            style={{ paddingLeft: 10 }}
                            className="passInput"
                            name="password"
                            onChange={handleChange}
                        />
                    </form>
                    <button className="log-btn" onClick={handleLogin}>
                        Đăng nhập
                    </button>
                </div>
                <button className="reg">Đăng ký</button>
            </div>
        </div>
    );
}
