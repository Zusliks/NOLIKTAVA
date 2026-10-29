const ROLES = {
  ADMIN: {
    label: "Administrators",
    tasks: ["Pārvalda lietotāju kontus un lomas", "Pievieno, rediģē un dzēš noliktavas datus", "Skata un ģenerē sistēmas pārskatus"],
    menu: [["Sākums", "home", "home"], ["Pievienot produktu", "plus", "data"], ["Pievienot lietotāju", "plus", "register"], ["Lietotāji", "user", "users"]]
  },
  WORKER: {
    label: "Noliktavas darbinieks",
    tasks: ["Pārvalda preču informāciju un pasūtījumus", "Maina pasūtījumu statusus", "Skata un ģenerē sistēmas pārskatus"],
    menu: [["Sākums", "home", "home"], ["Veikt pasūtījumu", "order", "orders"], ["Sagatavot atskaiti", "report", "report"]]
  },
  SORTER: {
    label: "Plauktu kārtotājs",
    tasks: ["Skata preču informāciju", "Reģistrē un atjaunina preču izvietojumu plauktos", "Gatavo pārskatus par preču stāvokli"],
    menu: [["Sākums", "home", "home"], ["Izvietot preces", "placement", "locations"], ["Sagatavot atskaiti", "report", "report"], ["Datu ievade", "user", "stock"]]
  }
};

export default ROLES;
