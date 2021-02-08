// client-side js
// run by the browser each time your view template referencing it is loaded
$(document).ready(function() {
  let testMessage = () => {
    console.log("dataSent");
  };

  var reqCards = [];

  function passWord() {
    var testV = 1;
    var pass1 = prompt("Please Enter Your Password", " ");
    while (testV < 3) {
      if (!pass1) history.go(-1);
      if (pass1.toLowerCase() == 'fogcreek') {
        var notes = prompt("You Got it Right! Please enter order information here", " ");
        var cardID = { id: event.srcElement.id,
                       notes: notes
                     };
        $.post("/ordered", cardID, async data => {
      console.log("Sent order info to database.");
    });
        break;
      }
      testV += 1;
      var pass1 = prompt(
        "Access Denied - Password Incorrect, Please Try Again.",
        "Password"
      );
    }
    if ((pass1.toLowerCase() == 'fogcreek') & (testV == 3)) history.go(-1);
    return " ";
  }

  function updateNote(){
    var noteID = event.srcElement.id;
    noteID = noteID.split("-", 1);
    var addNotes = prompt("Please enter your note here", " ");
    $.post("/updatenote", { id: noteID, note: addNotes }, async data => {
      console.log("Sent note to database.")
    });
  }
  
  function firstNote(){
    alert('Update coming very soon');
  }
  
  $.get("/getcards", "JSON", async data => {
    try {
      var dataObj = await JSON.parse(data);
      reqCards = await Object.values(dataObj);

      for (var i = 0; i < reqCards.length; i++) {
        var drc = new Date(reqCards[i].created);
        drc = drc.toJSON().substring(0, 10);
        var notesField;
        if(reqCards[i].notes == null){notesField = "none";} else {notesField = reqCards[i].notes;}
        $("#tracking-area")
          .append(`<div class="right__tracking-area--card" id="card${reqCards[i].id}"><div class="right__tracker-area--card--list right__tracker-area--card--list--h2"><h2>${reqCards[i].employee}</h2></div>
    <div class="right__tracker-area--card--list">Item: ${reqCards[i].item}</div>
    <div class="right__tracker-area--card--list">Category: ${reqCards[i].category}</div>
    <div class="right__tracker-area--card--list">Requested On: ${drc}</div>
    <div class="right__tracker-area--card--list">Status: ${reqCards[i].status}</div>
    <div class="right__tracker-area--card--list" id="notes${reqCards[i].id}">Notes: ${notesField}</div>
    <div><button class="ordered" id='${reqCards[i].id}'>Order</button></div>
    <div><button class="addnote" id='${reqCards[i].id}-note'>Add Note</button></div>
    <div><button class="complete" id='${reqCards[i].id}-complete'>Complete</button></div>
    </div>`);
      }
    } catch (error) {
      console.log(error);
    }
  });

  $("#form-r").submit(function() {
    // Variables for form input values
    var empName = $("#employee_name").val();
    var item = $("#item").val();
    var linkAddress = $("#link_address").val();
    var whenNeeded = $("#when_needed").val();
    var whyNeeded = $("#why_needed").val();
    var category = $("#category").val();
    var reqTime = Date.now();

    // Build object to send over to server
    let initialRequest = {
      employee: empName,
      item: item,
      link: linkAddress,
      when_needed: whenNeeded,
      why_needed: whyNeeded,
      category: category,
      request_time: reqTime
    };

    //let sendRequest = JSON.stringify(initialRequest);

    // Send info to server to be put into database
    $.post("/newrequest", initialRequest, async data => {
      try {
        var dataObjR = await JSON.parse(data);
        reqCards = await Object.values(dataObjR);

        for (var i = 0; i < reqCards.length; i++) {
          var drc = new Date(reqCards[i].created);
          drc = drc.toJSON().substring(0, 10);
          $("#tracking-area")
            .append(`<div class="right__tracking-area--card"><h2>Name: ${reqCards[i].employee}</h2>
    Item: ${reqCards[i].item}<br><br>
    Category: ${reqCards[i].category}<br><br>
    Requested On: ${drc}<br><br>
    Status: ${reqCards[i].status}<br><br>
    </div>`);
          alert("You're Request Has Been Added!");
        }
      } catch (error) {
        console.log(error);
      }
    });
    return false;
  });

  $("body").delegate(".ordered", "click", function() {
    passWord();
  });
  
  $("body").delegate(".addnote", "click", function() {
    var ttt = event.srcElement.id;
    ttt = ttt.split("-", 1);
    var sss = 'notes' + ttt;
    var bbb = $("#"+sss).text();
    if(bbb == "Notes: none"){
      firstNote();
    } else {
      updateNote();
    }
  });
});
