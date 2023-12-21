import React, { useEffect, useState } from "react";
import axios from "axios";

import "./Todo.scss";

export default function TodoList() {
    let [todos, setTodos] = useState([]);
    let [name, setName] = useState("");
    let [hidden, setHidden] = useState(null);
    let [newTodo, setNewTodo] = useState([]);
    let [isLoaded, setIsLoaded] = useState(false);
    let [statusBox, setStatusBox] = useState(false);
    let [quantity, setQuantity] = useState(0);
    const handleSubmit = (e) => {
        e.preventDefault();
    };
    //
    const token = localStorage.getItem("token");
    const data = async () => {
        const res = await axios.get("http://localhost:3000/todo", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });
        setTodos(res.data.data);
        console.log(res.data.data,"dòng 26");
    };

    useEffect(() => {
        data();
    }, []);

    const nameChange = (e) => {
        setName(e.target.value);
        
    };

    const upLoad = async () => {
        const token = localStorage.getItem("token");
        if(name==""){
            alert("Bạn ko đc bỏ trống")
        }else{
            const response = await axios.post(
                "http://localhost:3000/todo",
                {
                    taskName: name,
                    Status: "not complete",
                    Detail: "lorem",
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );
            console.log(response.data, "dòng43");
            setTodos(response.data);
            setName("");
        }
    };
    // console.log(todos, "vvvvvvvv");
    const removeToDo = async (item) => {
        let confirm1 = confirm("Xóa?");
        if (confirm1) {
            const res = await axios.delete(
                `http://localhost:3000/todo/${item.id}`,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            ); 
            setTodos(res.data);
        }
    };
    const fixToDo = (item) => {
        
        setName(item.taskName);
        setNewTodo(item);
    };
    const handleSave = async () => {
        let newArr = todos.find((item) => {
            if (item.id == newTodo.id) {
                item.taskName = name;

                return item;
            }
        })
        console.log(newArr,"dòng 80");
       if(name!=""){
         await axios.put(`http://localhost:3000/todo/${newArr.id}`, newArr, {
             headers: {
                 Authorization: `Bearer ${token}`,
             },
         });
         setName("");
       }else{
        alert("Ko đc để trống")
       }
    };
    const changeStatus = async (item) => {
        const updatedStatus =
            item.status === "not complete" ? "completed" : "not complete";

        try {
            const response = await axios.put(
                `http://localhost:3000/todo/${item.id}`,
                {
                    name: item.name || "",
                    detail: item.detail || "",
                    status: updatedStatus,
                }
            );

            const updatedItem = response.data;
        } catch (error) {
            console.log(error);
        }
    };

    return (
        <div className="All">
            <form onSubmit={handleSubmit}>
                <h1>Có công việc</h1>
                <h2>Todo List</h2>
                <div className="upper">
                    <input
                        type="text"
                        name="name"
                        onChange={nameChange}
                        value={name}
                    />
                    <button onClick={upLoad}>+</button>
                    <button onClick={handleSave}>Save</button>
                </div>
                <div className="down">
                    <table style={{ width: "100%" }}>
                        <thead>
                            <tr>
                                <td>ID</td>
                                <td>Name</td>
                                <td>Detail</td>
                                <td>Status</td>
                                <td>Action</td>
                            </tr>
                        </thead>
                        <tbody>
                            {todos.map((item) => {
                                return (
                                    <tr key={item.id}>
                                        <td>{item.id}</td>
                                        <td>{item.taskName}</td>
                                        <td>{item.Detail}</td>
                                        <td>{item.Status}</td>
                                        <td>
                                            <button
                                                onClick={() => removeToDo(item)}
                                            >
                                                Xóa
                                            </button>
                                            <button
                                                onClick={() => fixToDo(item)}
                                            >
                                                Sửa
                                            </button>
                                            <button
                                                onClick={() =>
                                                    changeStatus(item)
                                                }
                                            >
                                                Đổi
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </form>
        </div>
    );
}
