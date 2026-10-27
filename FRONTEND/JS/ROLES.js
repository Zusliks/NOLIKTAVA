const ROLES = {
  ADMIN: {
    label: "Administrators",
    tasks: ["Pārvalda lietotāju kontus un lomas", "Pievieno, rediģē un dzēš noliktavas datus", "Skata un ģenerē sistēmas pārskatus"],
    menu: [["Sākums", "home", "home"], ["Lietotāji", "users", "users"], ["Noliktavas dati", "shelf", "data"], ["Pārskati", "report", "report"]]
  },
  WORKER: {
    label: "Noliktavas darbinieks",
    tasks: ["Pārvalda preču informāciju un pasūtījumus", "Maina pasūtījumu statusus", "Skata un ģenerē sistēmas pārskatus"],
    menu: [["Sākums", "home", "home"], ["Preces", "box", "products"], ["Pasūtījumi", "order", "orders"], ["Pārskati", "report", "report"]]
  },
  SORTER: {
    label: "Plauktu kārtotājs",
    tasks: ["Skata preču informāciju", "Reģistrē un atjaunina preču izvietojumu plauktos", "Gatavo pārskatus par preču stāvokli"],
    menu: [["Sākums", "home", "home"], ["Preces", "box", "stock"], ["Izvietojums", "pin", "locations"], ["Pārskati", "report", "report"]]
  }
};

export default ROLES;
