import Ember from "ember";
import { generateFullKeySet, getDifferences } from "ember-object-diff/utils/object-diff";

export default Ember.Controller.extend({
  stringyObject: `{
    "hello": "world",
    "how": {
      "are_you": "today?"
    },
    "i_am": ["really", "rather", { "good": { "thank": "you" } }]
  }`,
  stringyObject2: `{
    "hello": "world",
    "how": {
      "are_you": "today?"
    },
    "i_am": ["really", "rather", { "good": { "thank": "you1" } }]
  }`,
  keysForObject: Em.computed("stringyObject", function() {
    try {
      let object = JSON.parse(this.get("stringyObject"));
      return generateFullKeySet(object);
    } catch(error) {
      console.error(error);
      return null;
    }
  }),
  differences: Em.computed("stringyObject", function() {
    try {
      let object = JSON.parse(this.get("stringyObject"));
      let object2 = JSON.parse(this.get("stringyObject2"));
      return getDifferences(object, object2);
    } catch(error) {
      console.error(error);
      return null;
    }
  })
});