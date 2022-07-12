// Create a class for the element
class ExpandingList extends HTMLUListElement {
  constructor() {
    // Return value from super() is a reference to this element
    self = super();

    // Get ul and li elements that are a child of this custom ul element
    // li elements can be containers if they have uls within them
    const uls = Array.from(self.querySelectorAll("ul"));
    const lis = Array.from(self.querySelectorAll("li"));

    // Hide all child uls
    // These lists will be shown when the user clicks a higher level container
    uls.forEach((ul) => {
      ul.style.display = "block";
    });
    let index = 0;
    // Look through each li element in the ul
    lis.forEach((li) => {
      const childText = li.childNodes[0];
      const name = childText.textContent.trim().split(" ").join("-");
      li.setAttribute("id", `id-${name}-${index}`);

      const imgElem = document.createElement("img");


      imgElem.src = "./img/unselected.png";
      imgElem.setAttribute("class", "state");
      imgElem.setAttribute("data-id", `id-${name}-${index}`);
      imgElem.setAttribute("id", `id-${name}-${index++}-img`);
      imgElem.setAttribute("data-state", "unselected");
      imgElem.onclick = self.toggleState;

      childText.parentNode.insertBefore(imgElem, childText);

      // If this li has a ul as a child, decorate it and add a click handler
      if (li.querySelectorAll("ul").length > 0) {
        //node has children
        // Add an attribute which can be used  by the style

        li.setAttribute("class", "open");

        // Wrap the li element's text in a new span element
        // so we can assign style and event handlers to the span

        const newSpan = document.createElement("span");

        // Copy text from li to span, set cursor style
        newSpan.textContent = childText.textContent;
        newSpan.style.cursor = "pointer";

        // Add click handler to this span
        newSpan.onclick = self.showul;

        // Add the span and remove the bare text node from the li
        childText.parentNode.insertBefore(newSpan, childText);
        childText.parentNode.removeChild(childText);


      }
    });

    let parentArr = [];

    lis.forEach((li) => {
      if (li.querySelectorAll("ul").length > 0){
        const childText = li.childNodes[0];
        const curElem = document.getElementById(childText.getAttribute("id").replace("-img", ""));
        parentArr.push({id: curElem.id, childCount:  li.querySelectorAll("li").length, ulCount: li.querySelectorAll("ul").length, hasParent: !!li.parentNode.parentNode.id, parent: li.parentNode.parentNode.id });
      }
    });

    for(parent in parentArr){
      while(parentArr[parent].ulCount > 1) {
        parentArr[parent].childCount = parentArr[parent].childCount - parentArr.find(prnt => prnt.parent === parentArr[parent].id).childCount;
        parentArr[parent].ulCount--;
      }
    }

    parentArr.forEach(parent => {
      const parentElem = document.getElementById(parent.id);
      const childCountSpan = document.createElement("span");
      childCountSpan.textContent = parentElem.getElementsByTagName("span")[0].innerHTML.trim() + ' (' + parent.childCount + ')';
      childCountSpan.style.color = "blue";
      parentElem.getElementsByTagName("span")[0].innerHTML = childCountSpan.textContent;
    })
  }

  // li click handler
  showul = function (e) {
    // next sibling to the span should be the ul
    const nextul = e.target.nextElementSibling;

    // Toggle visible state and update class attribute on ul
    if (nextul.style.display == "block") {
      nextul.style.display = "none";
      nextul.parentNode.setAttribute("class", "closed");
    } else {
      nextul.style.display = "block";
      nextul.parentNode.setAttribute("class", "open");
    }
  };

  // li click handler
  toggleState = function (e) {
    // next sibling to the span should be the ul
    const target = e.target;
    const elementId = target.getAttribute("data-id");
    const oldState = target.getAttribute("data-state");

    let newState = oldState === "unselected" ? "selected" : "unselected";
    const componentObject = {
      elementId,
      // oldState,
      newState,
    };

    //component output
    alert(JSON.stringify(componentObject, null, 4));

    const parentId = e.target.parentNode.parentNode.parentNode.id;
    // Check if new State is selected, then all the node below are also selected
    if (newState == "selected") {
      target.src = "./img/selected.png";
      target.setAttribute("data-state", "selected");
      let targetElem = document.getElementById(elementId);
      if (targetElem.querySelectorAll("ul").length > 0) {
        //updating children
        const childImgs = targetElem.querySelectorAll("img");
        childImgs.forEach((imgElem) => {
          imgElem.src = "./img/selected.png";
          imgElem.setAttribute("data-state", "selected");
        });
      }
      //update parent
      self.updateParent(parentId, newState);
    } else {
      target.src = "./img/unselected.png";
      target.setAttribute("data-state", "unselected");
      let targetElem = document.getElementById(elementId);

      if (targetElem.querySelectorAll("ul").length > 0) {
        const childImgs = targetElem.querySelectorAll("img");
        childImgs.forEach((imgElem) => {
          imgElem.src = "./img/unselected.png";
          imgElem.setAttribute("data-state", "unselected");
        });
      }
      self.updateParent(parentId, newState);
    }
  };

  updateParent(parentId, newState) {
    //check if parentId Exists
    //if no then the propagation of event stops
    if (parentId) {
      const imgId = parentId + "-img";
      const parentImageElem = document.getElementById(imgId);
      const parentElem = document.getElementById(parentId);
      if (!!parentId && parentImageElem) {
        const oldState = parentImageElem.getAttribute("data-state");

        const imgList = [...parentElem.querySelectorAll("img")];
        const childImgs = imgList.slice(1); //to remove first parent img

        const totalChild = childImgs.length;
        let setState = 0,
          unsetState = 0,
          partial = 0;
        childImgs.forEach((imgIdx) => {
          const curImg = document.getElementById(imgIdx.id);

          // console.log(curImg)
          if (curImg.getAttribute("data-state") === "selected") setState++;
          else if (curImg.getAttribute("data-state") === "unselected")
            unsetState++;
          else partial++;
        });
        // console.log({ imgId, totalChild, setState, unsetState, partial });
        if (totalChild === setState) {
          // all children are selected
          parentImageElem.src = "./img/selected.png";
          parentImageElem.setAttribute("data-state", "selected");
        } else if (totalChild === unsetState) {
          parentImageElem.src = "./img/unselected.png";
          parentImageElem.setAttribute("data-state", "unselected");
        } else {
          parentImageElem.src = "./img/partial.png";
          parentImageElem.setAttribute("data-state", "partial");
        }
      }
      if (
        parentElem &&
        parentElem.parentNode &&
        parentElem.parentNode.parentNode.id
      ) {
        self.updateParent(parentElem.parentNode.parentNode.id, newState);
      }
    }
  }
}

// Define the new element
customElements.define("selectable-tree", ExpandingList, { extends: "ul" });
