const ROLES = {
  ADMIN: { label: "Administrators", image: "IMG/ADMIN.png", menu: ["Sākums", "Pievienot produktu", "Pievienot lietotāju", "Lietotāji", "Iziet"] },
  WORKER: { label: "Noliktavas darbinieks", image: "IMG/WORKER.png", menu: ["Sākums", "Veikt pasūtījumu", "Sagatavot atskaiti", "Iziet"] },
  SORTER: { label: "Plauktu kārtotājs", image: "IMG/SORTER.png", menu: ["Sākums", "Izvietot preces", "Sagatavot atskaiti", "Datu ievade", "Iziet"] }
};

export default ROLES;
