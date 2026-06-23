let applications =
    JSON.parse(localStorage.getItem("applications")) || [];

let searchTerm = "";

const searchInput =document.getElementById("search-input");

searchInput.addEventListener("input", function(){

    searchTerm = this.value.toLowerCase();

    renderApplications();

});


let filterStatus = "All";

const filterDropdown =
    document.getElementById("filter-status");

filterDropdown.addEventListener("change", function(){

    filterStatus = this.value;

    renderApplications();

});

let editIndex = null;


const form = document.getElementById("application-form");
form.addEventListener("submit", function(event) {
    event.preventDefault();
    const company = document.getElementById("company").value;
    const role = document.getElementById("role").value;
    const location = document.getElementById("location").value;
    const date = document.getElementById("date").value;
    const status = document.getElementById("status").value;
    const notes = document.getElementById("notes").value;

    const application = {
        company,
        role,
        location,
        date,
        status,
        notes
    };

    const isEditing = editIndex !== null;

    if(isEditing){

        applications[editIndex] = application;

        editIndex = null;

        document.getElementById("submit-btn").textContent =
            "Add Application";

    }else{

        applications.push(application);

    }

    showToast(
        isEditing
            ? "✏️ Application Updated"
            : "✅ Application Added"
    );
    
    form.reset();

    localStorage.setItem(
    "applications",
    JSON.stringify(applications)
    );


    renderApplications();
    updateDashboard();
    updateLastUpdated();
});

function renderApplications(){
    const tableBody = document.getElementById("applications-body");
    tableBody.innerHTML = "";

    const filteredApplications =
    applications.filter(function(application){

        const matchesSearch =
            application.company
                .toLowerCase()
                .includes(searchTerm)

            ||

            application.role
                .toLowerCase()
                .includes(searchTerm);

        const matchesStatus =
            filterStatus === "All"
            ||
            application.status === filterStatus;

        return matchesSearch && matchesStatus;
    });

    filteredApplications.sort(
    (a, b) => new Date(b.date) - new Date(a.date));
    
    if(filteredApplications.length === 0){

        tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    📭 No applications found
                </td>
            </tr>
        `;

        return;
    }

   
    filteredApplications.forEach(function(application,index){
        const row = document.createElement("tr");
        row.innerHTML = `
            <td>${application.company}</td>
            <td>${application.role}</td>
            <td>${application.location}</td>
            <td>${application.date}</td>
            <td>
                <span class="status-badge ${application.status.toLowerCase()}">
                    ${application.status}
                </span>
            </td>
            <td>${application.notes}</td>
            <td>
                <button onclick="editApplication(${index})">Edit
                </button>

                <button onclick="deleteApplication(${index})">Delete
                </button>
            </td>
        `;
        tableBody.appendChild(row);

    });
}

document.getElementById("export-btn").addEventListener("click", exportData);

document.getElementById("csv-export-btn").addEventListener("click",exportCSV);

document.getElementById("import-file").addEventListener("change", importData);


function updateDashboard() {

    document.getElementById("total-count").textContent = applications.length;
    const appliedCount = applications.filter(app => app.status === "Applied").length;

    const interviewCount = applications.filter(app => app.status === "Interview").length;

    const offerCount = applications.filter(app => app.status === "Offer").length;
    
    const successRate =applications.length === 0 ? 0 : Math.round((offerCount / applications.length) * 100);

    document.getElementById("success-rate")
    .textContent = successRate + "%";


    const rejectedCount = applications.filter(app => app.status === "Rejected").length;

    document.getElementById("applied-count").textContent =appliedCount;

    document.getElementById("interview-count").textContent =interviewCount;

    document.getElementById("offer-count").textContent =offerCount;

    document.getElementById("rejected-count").textContent =rejectedCount;

}

function updateLastUpdated() {

    const now = new Date();

    document.getElementById("last-updated").textContent =
        "Last Updated: " + now.toLocaleString();

}

function exportData(){

    const data = JSON.stringify(
        applications,
        null,
        2
    );

    const blob = new Blob(
        [data],
        {
            type: "application/json"
        }
    );

    const url =
        URL.createObjectURL(blob);

    const a =
        document.createElement("a");

    a.href = url;

    a.download =
        "job-applications.json";

    a.click();

    showToast(
        "📥 JSON Exported"
    );

    URL.revokeObjectURL(url);

}

function exportCSV(){

    let csv =
        "Company,Role,Location,Date,Status,Notes\n";

    applications.forEach(function(app){

        csv += app.company + "," +
               app.role + "," +
               app.location + "," +
               app.date + "," +
               app.status + "," +
               app.notes + "\n";

    });

    const blob = new Blob(
        [csv],
        {
            type: "text/csv"
        }
    );

    const url =
        URL.createObjectURL(blob);

    const a =
        document.createElement("a");

    a.href = url;

    a.download =
        "job-applications.csv";

    a.click();

    showToast(
        "📊 CSV Exported"
    );

    URL.revokeObjectURL(url);

}


function deleteApplication(index){
    const isConfirmed = confirm(
        "Are you sure you want to delete this application?"
    );

    if(!isConfirmed){
        return;
    }

    applications.splice(index,1);

    localStorage.setItem(
        "applications",
        JSON.stringify(applications)
    );

    renderApplications();
    updateDashboard();
    updateLastUpdated();

    showToast(
        "🗑️ Application Deleted"
    );
}
renderApplications();
updateDashboard();
updateLastUpdated();


function editApplication(index){

    const application = applications[index];

    document.getElementById("company").value =
        application.company;

    document.getElementById("role").value =
        application.role;

    document.getElementById("location").value =
        application.location;

    document.getElementById("date").value =
        application.date;

    document.getElementById("status").value =
        application.status;

    document.getElementById("notes").value =
        application.notes;

    editIndex = index;

    document.getElementById("submit-btn").textContent =
    "Update Application";

}

const themeButton =
    document.getElementById("theme-toggle");

    themeButton.addEventListener("click", function(){

    document.body.classList.toggle("dark");

    localStorage.setItem(
        "theme",
        document.body.classList.contains("dark")
            ? "dark"
            : "light"
    );

    updateThemeButton();

});


const savedTheme =
    localStorage.getItem("theme");

if(savedTheme === "dark"){

    document.body.classList.add("dark");

}
updateThemeButton();

function updateThemeButton(){

    const themeButton =
        document.getElementById("theme-toggle");

    if(document.body.classList.contains("dark")){

        themeButton.textContent =
            "☀️ Light Mode";

    }else{

        themeButton.textContent =
            "🌙 Dark Mode";

    }

}

function importData(event){

    const file =
        event.target.files[0];

    if(!file){
        return;
    }

    const reader =
        new FileReader();

    reader.onload = function(e){

        const importedData =
            JSON.parse(e.target.result);

        applications =
            importedData;

        localStorage.setItem(
            "applications",
            JSON.stringify(applications)
        );

        renderApplications();
        updateDashboard();
        updateLastUpdated();

        showToast(
            "📂 Applications Imported"
        );

    };

    reader.readAsText(file);

}
function showToast(message){

    const toast =
        document.getElementById("toast");

    toast.textContent = message;

    toast.classList.add("show");

    setTimeout(function(){

        toast.classList.remove("show");

    },2000);

}