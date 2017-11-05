"use strict";

new Vue({
  el: "#app",
  components: {
    icon: { template: '<svg><use :xlink:href="use"/></svg>', props: ["use"] }
  },

  data: function data() {
    return {
      modal: false,
      companies: [],
      dropdown: { height: 0 },
      rating: { min: 10, max: 0 },
      filters: { countries: {}, categories: {}, rating: 0 },
      menus: { countries: false, categories: false, rating: false }
    };
  },

  computed: {
    activeMenu: function activeMenu() {
      var _this = this;

      return Object.keys(this.menus).reduce(function ($$, set, i) {
        return _this.menus[set] ? i : $$;
      }, -1);
    },
    list: function list() {
      var _this2 = this;

      var _activeFilters = this.activeFilters;
      var countries = _activeFilters.countries;
      var categories = _activeFilters.categories;

      return this.companies.filter(function (_ref) {
        var country = _ref.country;
        var keywords = _ref.keywords;
        var rating = _ref.rating;

        if (rating < _this2.filters.rating) return false;
        if (countries.length && ! ~countries.indexOf(country)) return false;
        return !categories.length || categories.every(function (cat) {
          return ~keywords.indexOf(cat);
        });
      });
    },
    activeFilters: function activeFilters() {
      var _filters = this.filters;
      var countries = _filters.countries;
      var categories = _filters.categories;

      return {
        countries: Object.keys(countries).filter(function (c) {
          return countries[c];
        }),
        categories: Object.keys(categories).filter(function (c) {
          return categories[c];
        }),
        rating: this.filters.rating > this.rating.min ? [this.filters.rating] : []
      };
    }
  },

  watch: {
    activeMenu: function activeMenu(index, from) {
      var _this3 = this;

      if (index === from) return;

      this.$nextTick(function () {
        if (!_this3.$refs.menu || !_this3.$refs.menu[index]) {
          _this3.dropdown.height = 0;
        } else {
          _this3.dropdown.height = _this3.$refs.menu[index].clientHeight + 16 + "px";
        }
      });
    }
  },

  methods: {
    setFilter: function setFilter(filter, option) {
      var _this4 = this;

      if (filter === "countries") {
        this.filters[filter][option] = !this.filters[filter][option];
      } else {
        setTimeout(function () {
          _this4.clearFilter(filter, option, _this4.filters[filter][option]);
        }, 100);
      }
    },
    clearFilter: function clearFilter(filter, except, active) {
      var _this5 = this;

      if (filter === "rating") {
        this.filters[filter] = this.rating.min;
      } else {
        Object.keys(this.filters[filter]).forEach(function (option) {
          _this5.filters[filter][option] = except === option && !active;
        });
      }
    },
    clearAllFilters: function clearAllFilters() {
      Object.keys(this.filters).forEach(this.clearFilter);
    },
    setMenu: function setMenu(menu, active) {
      var _this6 = this;

      Object.keys(this.menus).forEach(function (tab) {
        _this6.menus[tab] = !active && tab === menu;
      });
    }
  },

  beforeMount: function beforeMount() {
    var _this7 = this;

    fetch("./mock-data.json").then(function (response) {
      return response.json();
    }).then(function (companies) {
      _this7.companies = companies;

      companies.forEach(function (_ref2) {
        var country = _ref2.country;
        var keywords = _ref2.keywords;
        var rating = _ref2.rating;

        _this7.$set(_this7.filters.countries, country, false);

        if (_this7.rating.max < rating) _this7.rating.max = rating;
        if (_this7.rating.min > rating) {
          _this7.rating.min = rating;
          _this7.filters.rating = rating;
        }

        keywords.forEach(function (category) {
          _this7.$set(_this7.filters.categories, category, false);
        });
      });
    });
  }
});

// inject svg spritesheet
fetch("https://s3-us-west-2.amazonaws.com/s.cdpn.io/450744/mock-logos.svg").then(function (response) {
  return response.text();
}).then(function (sprite) {
  var figure = document.createElement("figure");
  figure.style.display = "none";
  figure.innerHTML = sprite;
  document.body.insertBefore(figure, document.body.children[0]);
});