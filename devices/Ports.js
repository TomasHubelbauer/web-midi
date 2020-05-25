export default class Ports {
  titles = ['connection', 'id', 'manufacturer', 'name', 'state', 'type', 'version'];
  constructor(type, element) {
    this.type = type;
    const table = document.createElement('table');
    const thead = document.createElement('thead');
    const tr = document.createElement('tr');
    for (const title of this.titles) {
      const th = document.createElement('th');
      th.textContent = title;
      tr.append(th);
    }

    thead.append(tr);

    this.tbody = document.createElement('tbody');

    table.append(thead, this.tbody);
    element.append(table);
  }

  render(ports) {
    const tbody = document.createElement('tbody');
    for (const port of ports) {
      if (port.type !== this.type) {
        continue;
      }

      const tr = document.createElement('tr');

      const connectionTd = document.createElement('td');
      connectionTd.textContent = port.connection;
      tr.append(connectionTd);

      const idTd = document.createElement('td');
      idTd.textContent = port.id;
      tr.append(idTd);

      const manufacturerTd = document.createElement('td');
      manufacturerTd.textContent = port.manufacturer;
      tr.append(manufacturerTd);

      const nameTd = document.createElement('td');
      nameTd.textContent = port.name;
      tr.append(nameTd);

      const stateTd = document.createElement('td');
      stateTd.textContent = port.state;
      tr.append(stateTd);

      const typeTd = document.createElement('td');
      typeTd.textContent = port.type;
      tr.append(typeTd);

      const versionTd = document.createElement('td');
      versionTd.textContent = port.version;
      tr.append(versionTd);

      tbody.append(tr);
    }

    this.tbody.replaceWith(tbody);
    this.tbody = tbody;
  }
}
