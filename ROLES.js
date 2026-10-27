const ROLES = {
  ADMIN: { label: "Administrators", menu: [["Sākums", "home", "home"], ["Pievienot produktu", "add", "addProduct"], ["Pievienot lietotāju", "user-add", "addUser"], ["Lietotāji", "users", "users"], ["Datu pārvaldība", "shelf", "data"], ["Pārskati", "report", "report"], ["Iziet", "logout", "logout"]] },
  WORKER: { label: "Noliktavas darbinieks", menu: [["Sākums", "home", "home"], ["Preces", "shelf", "products"], ["Veikt pasūtījumu", "order", "orders"], ["Sagatavot atskaiti", "report", "report"], ["Iziet", "logout", "logout"]] },
  SORTER: { label: "Plauktu kārtotājs", menu: [["Sākums", "home", "home"], ["Izvietot preces", "shelf", "locations"], ["Sagatavot atskaiti", "report", "report"], ["Datu ievade", "user", "locations"], ["Iziet", "logout", "logout"]] }
};

export default ROLES;
