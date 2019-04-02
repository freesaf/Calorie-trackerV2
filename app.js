// Storage controller
const StorageCtrl = (function () {
    // Public method
    return {
        store: (item) => {
            let items;
            // check if there is anything in the LS
            if (localStorage.items === undefined) {
                items = [];
                items.push(item);
                localStorage.setItem('items', JSON.stringify(items));
            } else {
                items = JSON.parse(localStorage.getItem('items'));
                items.push(item);
                localStorage.setItem('items', JSON.stringify(items));
            }
        },
        get: () => {
            let items;
            if (localStorage.items === undefined) {
                items = [];
            } else {
                items = JSON.parse(localStorage.getItem('items'));
            }
            return items
        },
        remove: (item) => {

            //Get items from LS
            let items;
            items = JSON.parse(localStorage.getItem('items'));

            // find the index of the item to be deleted
            items.forEach((it, index) => {
                if (it.id === item.id) {
                    // let indx = items.indexOf(it);
                    items.splice(index, 1);
                }
            })

            // reset the LS
            localStorage.setItem('items', JSON.stringify(items));

        },
        update: (item) => {
            //Get items from LS
            let items;
            items = JSON.parse(localStorage.getItem('items'));
            // find the current item and update it
            items.forEach((it, index) => {
                if (it.id === item.id) {
                    items.splice(index, 1, item);
                }
            })

            // reset the LS
            localStorage.setItem('items', JSON.stringify(items));
        },
        clear: () => {
            // clear the storage
            localStorage.removeItem("items");
        }
    }
})()

// Item controller
const ItemCtrl = (function () {
    // Item Contructor
    const Item = function (id, name, calories) {
        this.id = id;
        this.name = name;
        this.calories = calories;
    }


    // Data structure / State
    const state = {
        items: StorageCtrl.get(),
        currentItem: null,
        totalCalories: 0
    }


    // Public methods
    return {
        getItems: () => {
            return state.items;
        },
        addItem: (name, calorie) => {
            // Generate the ID for the item
            let id;
            if (state.items.length > 0) {
                id = state.items.length
            } else {
                id = 0;
            };
            // turn calories into number
            calorie = parseInt(calorie);

            // instantiate new Item
            const newItem = new Item(id, name, calorie);
            state.items.push(newItem);
            return newItem;

        },
        // Get the calories sum 
        calorieSum: () => {
            state.totalCalories = 0;
            for (let i = 0; i < state.items.length; i++) {
                state.totalCalories += parseInt(state.items[i].calories);
            };
            return state.totalCalories
        },
        setCurrentItem: (item) => {
            state.currentItem = item;
        },
        getCurrentItem: () => {
            return state.currentItem;
        }
    }
})();


// UI Controller
const UICtrl = (function () {

    // Get all the UI selectors
    const UiSelectors = {
        ulList: document.querySelector('#item-list'),
        totalCalories: document.querySelector('.total-calories'),
        addBtn: document.querySelector('.add-btn'),
        backBtn: document.querySelector('.back-btn'),
        deleteBtn: document.querySelector('.delete-btn'),
        updateBtn: document.querySelector('.update-btn'),
        clearBtn: document.querySelector('.clear-btn'),
        itemName: document.querySelector('#item-name'),
        itemCalorie: document.querySelector('#item-calories')
    }
    // Create inner data skelteon to use with the list items
    const data = (item) => {
        return `
        <strong>${item.name}: </strong> <em>${item.calories} Calories</em>
        <a href="#" class="secondary-content">
        <i class="fa fa-pencil"></i>
        </a>
    `;
    };



    // Public methods
    return {
        // display li on the UI
        display: (arr) => {
            arr.forEach(item => {
                UiSelectors.ulList.innerHTML += `<li class="collection-item" id="item-${item.id}"> ${data(item)} </li>`
            });
        },
        // add items  to the UI 
        addList: (item) => {
            let li = document.createElement('li');
            li.className = "collection-item";
            li.id = `item-${item.id}`;

            // call the data function to get "li" inner content
            li.innerHTML = data(item);

            // append the li to the ul
            UiSelectors.ulList.appendChild(li);
        },
        getSelector: () => {
            return UiSelectors;
        },
        edit: (e, item) => {
            //  Show the item to be  edited
            UiSelectors.itemName.value = item.name
            UiSelectors.itemCalorie.value = parseInt(item.calories);

            // Show edit buttons
            UICtrl.showBtn();

            e.preventDefault();
        },
        removeItem: (e, item) => {
            // remove the selectedItem form the UI
            Array.from(UiSelectors.ulList.children).forEach((selectedItem => {
                if (selectedItem.id === `item-${item.id}`) {
                    selectedItem.remove();
                }
            }))

            // remove the item form the data structure
            let indx = ItemCtrl.getItems().indexOf(item);
            ItemCtrl.getItems().splice(indx, 1)

            // remove the item from the LS
            StorageCtrl.remove(item);

            // update the sum of the calories
            UICtrl.showTotal(ItemCtrl.calorieSum());

            UICtrl.clearinput();
            UICtrl.hideBtn(e);
            e.preventDefault();
        },
        updateItem: (e, item) => {
            // update the item in the UI
            const id = `item-${item.id}`;

            // get all the list items
            let itemList = Array.from(UiSelectors.ulList.children);

            // find the current list item and update it
            itemList.forEach((i => {
                if (i.id === id) {
                    item.name = UiSelectors.itemName.value;
                    item.calories = UiSelectors.itemCalorie.value;
                    i.innerHTML = data(item);
                }
            }))

            // // update the item in the data structure
            let indx = ItemCtrl.getItems().indexOf(item);
            ItemCtrl.getItems().splice(indx, 1, item)

            // update the item in the LS
            StorageCtrl.update(item);
            // update the sum of the calories
            UICtrl.showTotal(ItemCtrl.calorieSum());

            UICtrl.clearinput();
            UICtrl.hideBtn(e);
            e.preventDefault();
        },
        showBtn: () => {
            UiSelectors.addBtn.style.display = 'none'
            document.querySelectorAll('.edit-mode').forEach((btn) => {
                btn.style.display = 'inline-block';
            })
        },
        back: (e) => {
            // ignore changes and clear the UI
            UICtrl.hideBtn();
            UICtrl.clearinput();
            e.preventDefault();
        },
        hideBtn: () => {
            UiSelectors.addBtn.style.display = 'inline-block'
            document.querySelectorAll('.edit-mode').forEach((btn) => {
                btn.style.display = 'none';
            })
        },
        showTotal: (sum) => {
            UiSelectors.totalCalories.innerHTML = sum;
        },
        clearinput: () => {
            UiSelectors.itemName.value = '';
            UiSelectors.itemCalorie.value = '';
        },
        clearAll: (e) => {
            UICtrl.clearinput();
            UiSelectors.ulList.innerHTML = '';
            UiSelectors.totalCalories.innerText = parseInt(0);
            StorageCtrl.clear();
            ItemCtrl.getItems().length = 0;

            e.preventDefault();
        }
    }
})();




// App controller
const App = (function () {


    // Load Event Listener
    // const loadEvnt = function () {
    // get selectors
    const UiSelectors = UICtrl.getSelector();

    // Add event Listener
    UiSelectors.addBtn.addEventListener('click', (e) => {
        name = UiSelectors.itemName.value;
        calorie = UiSelectors.itemCalorie.value;
        if (name !== '' && calorie !== '') {
            const newItem = ItemCtrl.addItem(name, calorie);
            UICtrl.addList(newItem);
            UICtrl.showTotal(ItemCtrl.calorieSum());
            StorageCtrl.store(newItem);
            UICtrl.clearinput();
        }


        e.preventDefault();
    });
    // Enter Edit mode
    UiSelectors.ulList.addEventListener('click', (e) => {

        if (e.target.className === 'fa fa-pencil') {
            id = parseInt(e.target.parentElement.parentElement.id.split('-')[1]);
            ItemCtrl.getItems().forEach(item => {
                if (item.id === id) {
                    ItemCtrl.setCurrentItem(item)
                }
            })
            UICtrl.edit(e, ItemCtrl.getCurrentItem())
        }
    })



    UiSelectors.backBtn.addEventListener('click', (e) => {
        UICtrl.back(e)
    });

    UiSelectors.deleteBtn.addEventListener('click', (e) => {
        UICtrl.removeItem(e, ItemCtrl.getCurrentItem());
    });

    UiSelectors.updateBtn.addEventListener('click', (e) => {
        UICtrl.updateItem(e, ItemCtrl.getCurrentItem());
    });

    // Clear all fields
    UiSelectors.clearBtn.addEventListener('click', (e) => {
        UICtrl.clearAll(e);
    })
    // }

    // Public methods
    return {
        // loadEvnt: loadEvnt(),
        Init: function () {
            UICtrl.showTotal(ItemCtrl.calorieSum());
            UICtrl.hideBtn();

            const items = ItemCtrl.getItems();
            UICtrl.display(items);
        }
    }

})();
App.Init();