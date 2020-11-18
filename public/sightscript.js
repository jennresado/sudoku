/* Add DOM event listeners for form function. */
document.addEventListener('DOMContentLoaded', initializeForm);
document.addEventListener('DOMContentLoaded', changeOptions);

var selectOptions = document.getElementsByClassName('optionalSelect')

/*Function to initialize form to hide unselected dropdown options*/
function initializeForm() {
    for(let i=0; i < selectOptions.length; i++){
        selectOptions[i].style.display = "none";
    }
}

/*Function to change optional dropdown when search type is changed*/
function changeOptions() {
	document.getElementById('searchType').addEventListener('change', function(event){
        var currSelect = document.getElementsByClassName('selected');
        var submitText = document.getElementById('sightSubmit');
        
        while (currSelect.length != 0) {
            currSelect[0].style.display = "none";
            currSelect[0].classList.add("optionalSelect");
            currSelect[0].classList.remove("selected");
        }

        var newSelect = document.getElementById('searchType').value;
        
        if (newSelect == "Pokemon") {
            var pokeOptions = document.getElementsByClassName('pokemon');

            for (let p=0; p < pokeOptions.length; p++) {
                pokeOptions[p].style.display = "block";
                pokeOptions[p].classList.remove("optionalSelect");
                pokeOptions[p].classList.add("selected");
                }
            
            submitText.value = "Click for Your Pokemon Sightings";
        }

        else if (newSelect == "City") {
            var cityOptions = document.getElementsByClassName('city');

            for (let c=0; c < cityOptions.length; c++) {
                cityOptions[c].style.display = "block";
                cityOptions[c].classList.remove("optionalSelect");
                cityOptions[c].classList.add("selected");
                }
            
            submitText.value = "Click for Your City Sightings";
        }
 
        else {
            var stateOptions = document.getElementsByClassName('state');

            for (let s=0; s < stateOptions.length; s++) {
                stateOptions[s].style.display = "block";
                stateOptions[s].classList.remove("optionalSelect");
                stateOptions[s].classList.add("selected");
                }
            
            submitText.value = "Click for Your State Sightings";
        }

        event.preventDefault();
    });
}
