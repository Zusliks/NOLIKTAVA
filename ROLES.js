const ROLES = {
  ADMIN: { label: "Administrators", menu: [["Sākums", "home"], ["Pievienot produktu", "add"], ["Pievienot lietotāju", "user-add"], ["Lietotāji", "users"], ["Iziet", "logout"]] },
  WORKER: { label: "Noliktavas darbinieks", menu: [["Sākums", "home"], ["Veikt pasūtījumu", "order"], ["Sagatavot atskaiti", "report"], ["Iziet", "logout"]] },
  SORTER: { label: "Plauktu kārtotājs", menu: [["Sākums", "home"], ["Izvietot preces", "shelf"], ["Sagatavot atskaiti", "report"], ["Datu ievade", "user"], ["Iziet", "logout"]] }
};

export default ROLES;
