export const filterOptions = {
  all: "",
  dataset: "DATASET",
  paper: "PAPER",
  entity: "ENTITY",
  join: "JOIN",
  tag: "TAG",
  selection: "SELECTION"
};

export const searchbarFiltersConfig = {
  method: "post",
  url: '{__type(name:"NodeType") {enumValues {name description}}}'
};
