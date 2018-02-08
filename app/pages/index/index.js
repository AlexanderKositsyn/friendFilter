/*---styles---*/
import "normalize.css";
import "../../sass/base.scss";

/*---js---*/
import svg4everybody from "../../../node_modules/svg4everybody/dist/svg4everybody";

import FriendFilter from "./FriendFilter";

document.addEventListener("DOMContentLoaded", function(event) {
  let app = new FriendFilter({
    idFriendFilter: "friend-filter",
    idUnfilteredInput: "inputAllFriendsList",
    idUnfilteredList: "allFriendsList",
    idFilteredInput: "inputSortedFriendsList",
    idFilteredList: "sortedFriendsList",
    idSaveButton: "saveButton",
    buttonToggleClass: "friend-filter__button-icon"
  });
  app.initFriendFilter();
});
