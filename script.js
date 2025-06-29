document.getElementById("verificationForm").addEventListener("submit",function(e){
    e.preventDefault();
    
    const fullName = document.getElementById("fullName").value;
    const dateOfBirth = document.getElementById("dateOfBirth").value;
    console.log(fullName);
    console.log(dateOfBirth);

    if(!fullName || !dateOfBirth){
        alert("Please fill in all fields");
        return;
    }

    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    const age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if(monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())){
        age--;
    }

    if(age < 10){
        alert("You must be 10 or older to access this service");
    }else{
        alert("Verification successful! Welcome to TaskFlow, " + fullName + "!");
        localStorage.setItem("username", fullName);
        window.location.href = "main.html";
    }
});

document.querySelectorAll(".form-input").forEach(input =>{
    input.addEventListener("focus",function(){
        this.parentElement.style.transform = "translateY(-2px)";
    })
    input.addEventListener("blur",function(){
        this.parentElement.style.transform = "translateY(0)";
    })
})

