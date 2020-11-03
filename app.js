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

function addDepartment() {
    inquirer
        .prompt([
            {
                name: "Department Name",
                type: "input",
                message: "What is the name of the Department?",
            },
        ])
        .then(function (response) {

            connection.query(
                "INSERT INTO Department SET ?",
                {
                    name: response.name,
                },
                function (err) {
                    if (err) throw err;
                    console.log(`You have created a new Department ${response.name}.`)
                    employees();
                }
            );
        });
}

function addRole() {

    connection.query(
        "SELECT Department.name, Department.id FROM employee_trackerDB.Department",
        function (err, res) {
            if (err) throw err;

            inquirer
                .prompt([
                    {
                        name: "choice",
                        type: "list",
                        Options: function () {
                            var choicesArray = [];
                            for (var i = 0; i < res.length; i++) {
                                choiceArray.push(res[i].name);
                            }
                            return choiceArray;
                        },
                        message: "Which Department would you like to add a Role for?",
                    },
                ])
                .then(function (response) {
                    console.log(response);
                    console.log(response.choice);

                    connection.query(
                        `SELECT employee.first_name, employee.last_name, role.salary, role.title, department.name as Department Name"
                    FROM employeetrackerDB.employee
                    INNER JOIN role ON employee.role_id = role.id
                    INNER JOIN department ON role.department_id = department.id
                    WHERE department.name LIKE "${response.choice}"`,
                        function (err, res) {
                            if (err) throw err;
                            console.table(res);
                            employees();
                        }
                    );
                });
        }
    );
}

function addEmployees() {
    connection.query(
        "SELECT role.title, role.id FROM employee_trackerDB.role",

        function (err, data) {
            if (err) throw err;

            inquirer
                .prompt([
                    {
                        name: "first_name",
                        type: "input",
                        message: "Please enter first name of employee."
                    },
                    {
                        name: "last_name",
                        type: "input",
                        message: "Please enter last name of employee."
                    },
                    {
                        name: "role",
                        type: "list",
                        message: "Please choose a role.",
                        choices: function () {
                            const roleArray = [];
                            for (let i = 0; i < data.length; i++) {
                                roleArray.push(data[i].title);
                            }
                            return roleArray;
                        }
                    },
                ])
                .then(function (response) {
                    console.log(response.role);
                    let role_id;
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].title === answer.role) {
                            role_id = data[i].id;
                            console.log(role_id);
                        }
                    }
                    connection.query(
                        `INSERT INTO employee SET ?`,
                        {
                            first_name: response.first_name,
                            last_name: response.last_name,
                            role_id: role_id,
                        },
                        function (err) {
                            if (err) throw err;

                            console.log("You have added a new employee");

                            employees();
                        }
                    )
                })
        }
    )
};
