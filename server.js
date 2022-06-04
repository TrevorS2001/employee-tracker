//dependencies required
const mysql = require("mysql2");
const inquirer = require("inquirer");
require("console.table");

const connection = mysql.createConnection({
    host: '127.0.0.1',

    port: 3306,

    user: 'root',

    password: 'PlacePassWordHere',
    database: 'employeesDB'
});

connection.connect(function (err) {
    if (err) throw err;
    promptOne();
});

// function which prompts the user for what action they should take
function promptOne() {

  inquirer
    .prompt({
      type: "list",
      name: "task",
      message: "What would you like to choose?",
      choices: [
        "View Employees",
        "Add Employee",
        "Update Employee Role",
        "Add Role",
        "End"
      ]
    })
    .then(function ({ task }) {
      switch (task) {
        case "View Employees":
          viewEmployee();
          break;
      
        case "Add Employee":
          addEmployee();
          break;

        case "Update Employee Role":
          updateEmployeeRole();
          break;

        case "Add Role":
          addRole();
          break;

        case "End":
          connection.end();
          break;
      }
    });
}

//View Employees
function viewEmployee() {

  var query =
    `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
  FROM employee e
  LEFT JOIN role r
	ON e.role_id = r.id
  LEFT JOIN department d
  ON d.id = r.department_id
  LEFT JOIN employee m
	ON m.id = e.manager_id`

  connection.query(query, function (err, res) {
    if (err) throw err;
    promptOne();
  });

}

// Employee Array
function addEmployee() {

  var query =
    `SELECT r.id, r.title, r.salary 
      FROM role r`

  connection.query(query, function (err, res) {
    if (err) throw err;

    const roleChoice = res.map(({ id, title, salary }) => ({
      value: id, title: `${title}`, salary: `${salary}`
    }));

    promptInsert(roleChoice);
  });
}

function promptInsert(roleChoice) {

  inquirer
    .prompt([
      {
        type: "input",
        name: "first_name",
        message: "Employee's first name?"
      },
      {
        type: "input",
        name: "last_name",
        message: "Employee's last name?"
      },
      {
        type: "list",
        name: "roleId",
        message: "Employee's role?",
        choices: roleChoice
      },
    ])
    .then(function (response) {

      var query = `INSERT INTO employee SET ?`
      // insert a new item into the db
      connection.query(query,
        {
          first_name: response.first_name,
          last_name: response.last_name,
          role_id: response.roleId,
          manager_id: response.managerId,
        },
        function (err, res) {

          if (err) throw err;
          promptOne();
        });
    });
}

//"Update Employee Role" / UPDATE,
function updateEmployeeRole() { 
  employeeArray();

}

function employeeArray() {

  var query =
    `SELECT e.id, e.first_name, e.last_name, r.title, d.name AS department, r.salary, CONCAT(m.first_name, ' ', m.last_name) AS manager
  FROM employee e
  JOIN role r
	ON e.role_id = r.id
  JOIN department d
  ON d.id = r.department_id
  JOIN employee m
	ON m.id = e.manager_id`

  connection.query(query, function (err, res) {
    if (err) throw err;

    const employeeChoices = res.map(({ id, first_name, last_name }) => ({
      value: id, name: `${first_name} ${last_name}`      
    }));

    roleArray(employeeChoices);
  });
}

function roleArray(employeeChoices) {

  var query =
    `SELECT r.id, r.title, r.salary 
  FROM role r`
  let roleChoice;

  connection.query(query, function (err, res) {
    if (err) throw err;

    roleChoice = res.map(({ id, title, salary }) => ({
      value: id, title: `${title}`, salary: `${salary}`      
    }));

    promptEmployeeRole(employeeChoices, roleChoice);
  });
}

