//BUDGET CONROLLER
var budgetController =(function(){

    //Function constructor for Expenses
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalIncome){
        if(totalIncome > 0){
            this.percentage = Math.round((this.value/totalIncome) * 100);
        }
        else{
            this.percentage = -1;
        }
        
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
    };

    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    /* Insted of this we will be going to create an object thar will store our all information.
        var allExpenses = [];
        var allIncomes = [];
        var totalExpenses = 0;
        */

        var calculateTotal = function(type){
            var sum = 0;
            data.allitems[type].forEach(function(cur){
                sum = sum + cur.value;
            });
            data.totals[type] = sum;
        };

        var data = {
            allitems:{
                exp:[],
                inc:[]
            },
            totals:{
                exp:0,
                inc:0
            },
            budget:0,
            percentage:-1
        };

    return{
        addItem: function(type, des, val) {
            var newItem;
            
            // ID should be last ID +1. 
            
            //Create new ID
            if(data.allitems[type].length > 0){
                ID = data.allitems[type][data.allitems[type].length - 1].id + 1;
            }else{
                ID = 0;
            }
            
            
            //Create new item based on 'inc' or 'exp' type
            if (type === 'exp'){
                newItem = new Expense(ID, des, val);
            }else if (type === 'inc'){
                newItem = new Income(ID, des, val);
            }

            //Push it into our data structure
            data.allitems[type].push(newItem);
            
            //Return new element
            return newItem;
            
        },
        deleteItem: function(type, id){
            var ids, index;
            
            //id =6
            //data.allItems[type][id];
            //ids = [1 2 4 6 8]
            //index = 3

            var ids = data.allitems[type].map(function(current){
                return current.id;  
            });

            index = ids.indexOf(id);
            

            if (index !== -1){
                data.allitems[type].splice(index, 1);   
            }
        },

        calculateBudget: function(){

            //1. Calculate total income & Expenses
            calculateTotal('exp');
            calculateTotal('inc');

            //2. Calculate Budget: income - expenses
            data.budget = data.totals.inc - data.totals.exp;

            //3. Calculate percentage of income
            if(data.totals.inc > 0){
            data.percentage = Math.round((data.totals.exp/data.totals.inc) * 100);   
            }
            else{
                data.percentage = -1;
            }

        },

        calculatePercentages: function(){

            // (Expense/total income)
            data.allitems.exp.forEach(function(cur){
                cur.calcPercentage(data.totals.inc);
            });

        },
        getPercentages:function(){
            var allPerc = data.allitems.exp.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
        },

        getBudget: function(){
            return{
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        testing : function(){
            console.log(data);
        }
    }

})(); 

//UI CONTROLLER
var UIController = (function(){

    var DOMstrings = {
        inputType :'.add__type',
        inputDescription :'.add__description',
        inputValue :'.add__value',
        inputBtn : '.add__btn',
        incomeContainer: '.income__list',
        expensesContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expensesLabel : '.budget__expenses--value',
        percentLabel : '.budget__expenses--percentage',
        container: '.container',
        expensesPercLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };



    var formatNumber = function(num, type){
        var numSplit, int, dec, type;
        /* 
        + or - before number
        exactly 2 decimal points
        comma seperating thousands

        2310.4567 -> + 2.310.46
        */
       num = Math.abs(num);
       num = num.toFixed(2);

       numSplit = num.split('.');
       
       int = numSplit[0];
       
       if(int.length > 3){
        int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, int.length);
       }

       dec = numSplit[1]; 

       return (type === 'exp' ?'-' :'+') + ' ' + int + '.' + dec;
    };
    
    var nodeListForEach = function(list, callback){
        for (var i = 0; i < list.length; i++){
            callback(list[i], i);  
        }
    };

    return{                                     // return because return should be global
        getInput: function(){
            return{                             // creating a object instead of 3 variables
                type: document.querySelector(DOMstrings.inputType).value,
                description: document.querySelector(DOMstrings.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstrings.inputValue).value)
            };
        },
        getDOMstrings: function(){
            return DOMstrings;
        },

        addListItem: function(obj, type){
            var html, newHtml,element;
            
            // create HTML string with placeholder text
            if(type === 'inc'){
                element = DOMstrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%description%</div> <div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__delete"> <button class="item__delete--btn"><i class="ion-ios-checkmark-outline">x</i></button> </div> </div> </div>';
            }else if(type === 'exp'){
                element = DOMstrings.expensesContainer;
                html = '<div class="item clearfix" id="exp-%id%"> <div class="item__description">%description%</div><div class="right clearfix"> <div class="item__value">%value%</div> <div class="item__percentage">21%</div> <div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-checkmark-outline">x</i></button></div></div></div>';
            }
            
            // Replace placeholder text with some actual data
            newHtml = html.replace('%id%', obj.id); 
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));

            //Insert HTML into the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function(selectorID) {

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },

        clearFields : function(){
            var fields, fieldsArr;

            fields = document.querySelectorAll(DOMstrings.inputDescription + ',' + DOMstrings.inputValue);
            var fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });
            fieldsArr[0].focus();
        },

        changedType: function(){

            var fields = document.querySelectorAll(
                DOMstrings.inputType + ',' +
                DOMstrings.inputDescription + ',' + 
                DOMstrings.inputValue);
            
            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });

            document.querySelector(DOMstrings.inputBtn).classList.toggle('red');
        },

        displayPrecentages : function(percentages){
             
            var fields = document.querySelectorAll(DOMstrings.expensesPercLabel);

            nodeListForEach(fields, function(current, index){
                
                if (percentages[index]>0){
                    current.textContent = percentages[index] + '%';
                }
                else{
                    current.textContent = '---';
                }
                
            });

        },
        displayMonth : function(){
            var now, year, months, month;

            now = new Date();

            year = now.getFullYear();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            document.querySelector(DOMstrings.dateLabel).textContent = months[month] + ' ' + year;   

        },

        displayBudget : function(obj){
            var type;
            obj.budget > 0 ? type = 'inc' : type = 'exp';

            document.querySelector(DOMstrings.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMstrings.incomeLabel).textContent = formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMstrings.expensesLabel).textContent = formatNumber(obj.totalExp, 'exp');
            
            if(obj.percentage > 0){
                document.querySelector(DOMstrings.percentLabel).textContent = obj.percentage + '%';
            }
            else{
                document.querySelector(DOMstrings.percentLabel).textContent = '---';
            }
        }
    };

})();

//APP CONTROLLER
var controller = (function(budgetCltr, UICltr){

    var setUpEventListeners = function(){
        
        var DOM = UICltr.getDOMstrings();

        document.querySelector(DOM.inputBtn).addEventListener('click', cltrAddItem);
        document.addEventListener('keypress', function(event){
            if(event.keycode === 13 || event.which === 13) {
            cltrAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', cltrDeleteItem); 

        document.querySelector(DOM.inputType).addEventListener('change', UICltr.changedType);
    };
    
    var updateBudget = function(){
        //1. Calculate budget
        budgetCltr.calculateBudget();
        
        //2. Return the budget
        var budget = budgetCltr.getBudget();
        
        //3. Display budget on UI
        UICltr.displayBudget(budget);
    };

    var updatePercentages = function(){

        //1. Calculate percentages
        budgetCltr.calculatePercentages();

        //2. Read percentages from budget controller
        var percentages = budgetCltr.getPercentages();

        //3. update UI with new percentages
        UICltr.displayPrecentages(percentages);
    };

    var cltrAddItem = function() {
        var input, newItem;
        
        //1. get the field input data
        input = UICltr.getInput();
        
        if(input.description !== "" && !isNaN(input.value) && input.value > 0){
            //2. Add item to budget Controller
            newItem = budgetCltr.addItem(input.type, input.description, input.value);
            
            //3. Add item to UI
            UICltr.addListItem(newItem, input.type); 
            
            //4. Clear the fields
            UICltr.clearFields();
            
            //5. Calculate and update Budget
            updateBudget();

            //6. Calculate and update percentages
            updatePercentages();
            
        }
    };

    var cltrDeleteItem = function(event){
        var itemID, splitID, type, ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        
        if(itemID){
           
            //inc-1
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]);

            //1. Delete item from data structure
            budgetCltr.deleteItem(type, ID)

            //2. Delete item from UI
            UICltr.deleteListItem(itemID);

            //3. Update and show new budget
            updateBudget();

            //4. Calculate and update percentages
            updatePercentages();
        }
    };

    return{
        init:function(){
            console.log('application has started');
            UICltr.displayMonth();
            UICltr.displayBudget({
                budget: 0,
                totalInc:0,
                totalExp: 0,
                percentage:-1
            });
            setUpEventListeners();

            
        }
    };

})(budgetController, UIController);

controller.init();

