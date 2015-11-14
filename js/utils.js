// Based on: http://stackoverflow.com/questions/5767325/remove-a-particular-element-from-an-array-in-javascript

// Extending Array prototype with new function,
// if that function is already defined in "Array.prototype", 
// then "Object.defineProperty" will throw an exception
Object.defineProperty(Array.prototype, "remove", {
    // Specify "enumerable" as "false" to prevent function enumeration
    enumerable: false,

    /**
    * Removes all occurence of specified item from array
    * @this Array
    * @param itemToRemove Item to remove from array
    * @returns {Array} Itself
    */
    value: function (itemToRemove) {
        // Iterate every array item
        for (var index = 0; index < this.length; index++) {
            // If current array item equals itemToRemove then
            if (this[index] === itemToRemove) {
                // Remove array item at current index
                this.splice(index, 1);

                // Decrement index to iterate current position 
                // one more time, because we just removed item 
                // that occupies it, and next item took it place
                index--;
            }
        }

        // Return count of removed items
        return this;
    }
});

Object.defineProperty(Array.prototype, "clone", {
    enumerable: false,
    value: function () {
        return this.concat([]);
    }
});