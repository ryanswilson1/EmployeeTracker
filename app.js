const mysql = require("mysql");
const inquirer = require("inquirer");
const cTable = require('console.table');
const { allowedNodeEnvironmentFlags } = require("process");

const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "zaq1zaq1ZAQ!ZAQ!",
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
                name: "name",
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
        "SELECT department.name, department.id FROM employee_trackerDB.department",
        function (err, data) {
            if (err) throw err;

            inquirer
                .prompt([
                    {
                        name: "title",
                        type: "input",
                        message: "Please input role name"
                    },
                    {
                        name: "salary",
                        type: "input",
                        message: "Please input salary"
                    },
                    {
                        name: "department",
                        type: "list",
                        message: "Which department?",
                        choices: function () {
                            const departmentArray = [];
                            const departmentArrayID = [];
                            for (let i = 0; i < data.length; i++) {
                                departmentArray.push(data[i].name);
                                departmentArrayID.push(data[i].id);
                            }
                            return departmentArray;
                        }
                    },
                ])
                .then(function (response) {
                    let department_id;
                    for (let i = 0; i < data.length; i++) {
                        if (data[i].name === response.department) {
                            department_id = data[i].id;
                            console.log(department_id);
                        }
                    }

                    connection.query(
                        `INSERT INTO role SET ?`,
                        {
                            title: response.title,
                            salary: response.salary,
                            department_id: department_id
                        },
                        function (err) {
                            if (err) throw err;

                            console.log(`${response.title} with salary of ${response.salary} in ${department_id} was created!`)
                            employees();
                        }
                    );
                });
        });
};

function addEmployee() {
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
                        if (data[i].title === response.role) {
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

function viewDepartments() {
    connection.query(
        "SELECT department.name FROM employee_trackerDB.department",
        function (err, data) {
            if (err) throw err;

            inquirer
                .prompt([
                    {
                        name: "department",
                        type: "list",
                        message: "Please select a Department.",
                        choices: function () {
                            const departmentArrayay = [];
                            for (let i = 0; i < data.length; i++) {
                                departmentArrayay.push(data[i].name);
                            }
                            return departmentArrayay;
                        }
                    }
                ])
                .then(function (response) {
                    console.log(response.department);

                    connection.query(
                        `SELECT employee.first_name, employee.last_name, role.salary, role.title, department.name as "Department Name"
               FROM employee_trackerDB.employee
               INNER JOIN role ON employee.role_id = role.id
               INNER JOIN department ON role.department_id = department.id
               WHERE department.name LIKE "${response.department}"`,
                        function (err, data) {
                            if (err) throw err;

                            console.table(data);
                            employees();
                        }
                    );
                });

        });
};

function viewRoles() {
    connection.query(
        `SELECT role.title FROM employee_trackerDB.role`,
        function (err, data) {
            if (err) throw err;

            inquirer
                .prompt([
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

                    connection.query(
                        `SELECT employee.first_name, employee.last_name, role.salary, role.title, department.name as "Department Name"
               FROM employee_trackerDB.employee
               INNER JOIN role ON employee.role_id = role.id
               INNER JOIN department ON role.department_id = department.id
               WHERE role.title LIKE "${response.role}"`,
                        function (err, data) {
                            if (err) throw err;

                            console.table(data);
                            employees();
                        }
                    );
                });
        });
};

function viewEmployee() {
    connection.query(
        `SELECT employee.first_name, employee.last_name, role.salary, role.title, department.name as "Department Name"
       FROM employee_trackerDB.employee
       INNER JOIN role ON employee.role_id = role.id
       INNER JOIN department ON role.department_id = department.id`,

        function (err, data) {
            if (err) throw err;

            console.table(data);
            employees();
        }
    );
};

function updateEmployeeRole() {
    connection.query(
        `SELECT employee.first_name, employee.last_name, role.salary, role.title, role.id, department.name as "Department Name"
       FROM employee_trackerDB.employee
       INNER JOIN role ON employee.role_id = role.id
       INNER JOIN department ON role.department_id = department.id`,

        function (err, data) {
            if (err) throw err;

            inquirer
                .prompt([
                    {
                        name: "employee",
                        type: "list",
                        message: "Please choose an employee to update.",
                        choices: function () {
                            const employeeArray = [];
                            for (let i = 0; i < data.length; i++) {
                                employeeArray.push(`${data[i].first_name} ${data[i].last_name}`)
                            }
                            return employeeArray;
                        }
                    }
                ])
                .then(function (response) {
                    connection.query(
                        `SELECT role.title, role.id, role.salary
                        FROM employee_trackerDB.role`,

                        function (err, data) {
                            if (err) throw err;

                            inquirer
                                .prompt([
                                    {
                                        name: "newRole",
                                        type: "list",
                                        message: "Please choose new role for employee",
                                        choices: function () {
                                            const roleArray = [];
                                            for (let i = 0; i < data.length; i++) {
                                                roleArray.push(data[i].title);
                                            }
                                            return roleArray;
                                        }
                                    }
                                ])
                                .then(function (response2) {
                                    let role_id, employee_id;

                                    connection.query(
                                        `SELECT employee.first_name, employee.last_name, employee.id
                                         FROM employee_trackerDB.employee`,

                                        function (err, data2) {
                                            if (err) throw err;

                                            for (let i = 0; i < data2.length; i++) {
                                                if (`${data2[i].first_name} ${data2[i].last_name}` === response.employee) {
                                                    employee_id = data2[i].id;
                                                }
                                            }
                                            connection.query(
                                                `SELECT role.title, role.salary, role.id
                                                FROM employee_trackerDB.role`,

                                                function (err, data3) {
                                                    if (err) throw err;
                                                    for (let i = 0; i < data3.length; i++) {
                                                        if (`${data3[i].title}` === response2.newRole) {
                                                            role_id = data3[i].id;
                                                        }
                                                    }

                                                    connection.query(
                                                        `UPDATE employee
                                                         SET ?
                                                         WHERE ?`,
                                                        [
                                                            {
                                                                role_id: role_id
                                                            },
                                                            {
                                                                id: employee_id
                                                            }
                                                        ],
                                                        function (err) {
                                                            if (err) throw err;
                                                            console.log("Role Changed!");
                                                            employees();
                                                        }
                                                    )
                                                }
                                            )
                                        }
                                    )
                                })
                        });
                });
        });
};