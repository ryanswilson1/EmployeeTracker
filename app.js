const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require('console.table');
const { allowedNodeEnvironmentFlags } = require("process");

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "employee_trackerDB"
});

connection.connect(function (err) {
    if (err) throw err;

    employees();
});

function employees() {
    inquirer
        .prompt({
            type: "list",
            name: "command",
            message: "Choose Below",
            choices: [
                "Add a Department",
                "Add a Role",
                "Add an Employee",
                "View Departments",
                "View Roles",
                "View Employee",
                "Update Employee Role",
                "Exit",
            ],
        })
        .then(function (response) {
            switch (response.command) {
                case "Add a Department":
                    addDepartment();
                    break;
                case "Add a Role":
                    addRole();
                    break;
                case "Add an Employee":
                    addEmployee();
                    break;
                case "View Departments":
                    viewDepartments();
                    break;
                case "View roles":
                    viewRoles();
                    break;
                case "View Employee":
                    viewEmployee();
                    break;
                case "Update Employee Role":
                    updateEmployeeRole();
                    break;
                case "Exit":
                    connection.end();
                    break;
            }
        });
};