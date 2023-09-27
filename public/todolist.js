//.then((response) => response.json())
//const { response } = require("express");
function fetchAndDisplayTasks() {
  var todoListItem = document.querySelector(".todo-list");


  fetch("/api/tasks", {
    credentials: "include",
  })
    .then((reponse) => reponse.json())
    .then((tasks) => {
      tasks.forEach((task) => {
        var li = document.createElement("li");
        // Set the data-todo-id attribute for the task
        li.setAttribute("data-todo-id", task.todo_id);
        var checkbox =
          "<div class='form-check'> <label class='form-check-label'> <input class='checkbox' type='checkbox'/> ";
        var closeCircle =
          "<i class='input-helper'></i></label></div><i class='remove mdi mdi-close-circle-outline'></i>";
        li.innerHTML = checkbox + task.task_description + closeCircle;
        todoListItem.appendChild(li);  
      });
    });
}

document.addEventListener("DOMContentLoaded", function () {
  // reference to main list container
  var todoListItem = document.querySelector(".todo-list");
  // reference to the input field for adding new items
  var todoListInput = document.querySelector(".todo-list-input");
  // reference to the "Add" button
  var addButton = document.querySelector(".todo-list-add-btn");

  //fetch and display
  fetchAndDisplayTasks();

  // Event listener for the "Add" Button click
  addButton.addEventListener("click", function (e) {
    // Prevent the default form submission behavior
    e.preventDefault();

    // Get the task description from input
    const taskDescription = todoListInput.value;

    // If there is content in the input field
    if (taskDescription) {
      // send a POST Request to the server
      fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ task_description: taskDescription }),
        credentials: "include", // Ensure cookies are sent with the request
      })
        .then((response) => {
          if (!response.ok) {
            // log the raw reponse for debugging
            return response.text().then((text) => {
              throw new Error(
                `Server responded with ${response.status} : ${text}`
              );
            });
          }
          console.log("response is accepted.");
          return response.json();
        })
        .then((data) => {
          //create a new list item element
          var li = document.createElement("li");
          //set todo-id for each notes
          li.setAttribute("data-todo-id",data.todo_id);


          // set the inner content for the new list item
          var checkbox =
            "<div class='form-check'> <label class='form-check-label'> <input class='checkbox' type='checkbox'/> ";
          var closeCircle =
            "<i class='input-helper'></i></label></div><i class='remove mdi mdi-close-circle-outline'></i>";
          li.innerHTML = checkbox + taskDescription + closeCircle;
          // append the new list item to the main list
          todoListItem.appendChild(li);
          //clear the input field
          todoListInput.value = "";
        })
        .catch((error) => {
          console.log("There was an error:", error);
        });
    }
  });

  // Event listener for changes in the list (specially for checkboxes)
  todoListItem.addEventListener("change", function (e) {
    // if the cahnge element is a check box
    if (e.target.classList.contains("checkbox")) {
      var checkbox = e.target;

      //if checkbox is checked, add the 'completed' class to its parent list item
      if (checkbox.checkd) {
        checkbox.closest("li").classList.add("completed");
      } else {
        // if unchecked, remove the 'completed' class
        checkbox.closest("li").classList.remove("completed");
      }
    }
  });

  /*Javascript exit*/
  document
    .getElementById("signout-btn")
    .addEventListener("click", function (e) {
      e.preventDefault();
      fetch("/auth/signout", {
        method: "POST",
      }).then((response) => {
        if (response.ok) {
          window.location.href = "./index.html";
        } else {
          alert("Error signing out. Please try again.");
        }
      });
    });

  

  // event listener for clicks in the list 
  todoListItem.addEventListener("click" , function(e){
    // if the clicked element is a remove icon
    if (e.target.classList.contains("remove")) {
      // assuming each task 'li' has a 'data-todo-id' attribute with the task's ID
      const todoId = e.target.closest("li").getAttribute("data-todo-id");

      // Log the todoId to the console for debugging
      console.log("Task ID:", todoId);

      // Send DELETE request to server
      fetch(`/api/tasks/${todoId}`, {
        method: "DELETE",
        credentials : 'include'
      })
      .then(reponse => {
        if(!reponse.ok){
          throw new Error('Network response was not ok');
        }
        // if succesfful, remove the task from the front-end
        const li = e.target.closest("li");
        todoListItem.removeChild(li);
      })
      .catch(error =>{
        console.log("There was a problem with the fetch operation:" , error.message);
      });
    }
  });
});

// new design

// event listener for clicks in the list (specifically for the remove icon)
  // todoListItem.addEventListener("click", function (e) {
  //   // if the clicked element is a remove icon
  //   if (e.target.classList.contains("remove")) {
  //     // remove teh parent list item from the main list
  //     var li = e.target.preventElement;
  //     todoListItem.removeChild(li);
  //   }
  // });

//Wait for the DOM Content to fully load before executing the code

/*
document.addEventListener("DOMContentLoaded", function () {
  //reference to the main list container
  var todoListItem = document.querySelector(".todo-list");
  //reference to the input field for adding new items
  var todoListInput = document.querySelector(".todo-list-input");
  //reference to "Add" button
  var addButton = document.querySelector(".todo-list-add-btn");

  // Event listener for the "Add" button click
  addButton.addEventListener("click", function (event) {
    // prevent the default form submission behavior
    event.preventDefault();

    // get the value from the input field
    var item = todoListInput.value;

    // if there is content in the input field
    if (item) {
      // crate a new list item element
      var li = document.createElement("li");
      // set the inner content for the new list item
      var checkbox =
        "<div class='form-check'> <label class='form-check-label'> <input class='checkbox' type='checkbox'/> ";
      var closeCircle =
        "<i class='input-helper'></i></label></div><i class='remove mdi mdi-close-circle-outline'></i>";
      li.innerHTML = checkbox + item + closeCircle;
      // Append the new list item to the main list
      todoListItem.appendChild(li);
      // clear the input field
      todoListInput.value = "";
    }
  });
  */

/*
document
  .getElementById("addNoteButton")
  .addEventListener("click", function (event) {
    event.preventDefault();
    addNote();
  });

function addNoteToDom(noteText) {
  const notesList = document.getElementById("notesList");
  const li = document.createElement("li");
  li.textContent = noteText;
  notesList.appendChild(li);
}

function addNote() {
  const noteInput = document.getElementById("noteInput");
  const note = noteInput.value;

  // Send a POST request to your API
  fetch("/api/notes", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ note }),
  })
    .then((response) => response.json())
    .then((data) => {
      // Update my dom
      addNoteToDom(note);
      noteInput.value = "";
    })
    .catch((error) => {
      console.log("There was a problem with fetch operation:", error.message);
    });
}

function deleteNote(index) {
  // Send a DELETE request to your API
  fetch(`/api/notes/${index}`, {
    method: "DELETE",
  })
    .then((reponse) => response.json())
    .then((data) => {
      // update DOM
    })
    .catch((error) => {
      console.log(
        "There was a problem with the fetch operation:",
        error.message
      );
    });
}
*/
