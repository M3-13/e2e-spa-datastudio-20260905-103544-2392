import { describe, expect, it } from 'vitest';
import { parseCsv } from './csvParser';

describe('parseCsv', () => {
  it('erkennt Komma als Trennzeichen und eine Kopfzeile', () => {
    const dataset = parseCsv('Name,Alter,Stadt\nAlice,30,Berlin\nBob,25,Hamburg');
    expect(dataset.columns).toEqual([
      { id: 'col-0', name: 'Name', type: 'text' },
      { id: 'col-1', name: 'Alter', type: 'number' },
      { id: 'col-2', name: 'Stadt', type: 'text' },
    ]);
    expect(dataset.rows).toEqual([
      ['Alice', '30', 'Berlin'],
      ['Bob', '25', 'Hamburg'],
    ]);
  });

  it('erkennt Semikolon als Trennzeichen', () => {
    const dataset = parseCsv('Name;Alter\nAlice;30\nBob;25');
    expect(dataset.columns.map((column) => column.name)).toEqual([
      'Name',
      'Alter',
    ]);
    expect(dataset.rows).toEqual([
      ['Alice', '30'],
      ['Bob', '25'],
    ]);
  });

  it('erkennt Tabulator als Trennzeichen', () => {
    const dataset = parseCsv('Name\tAlter\nAlice\t30');
    expect(dataset.columns.map((column) => column.name)).toEqual([
      'Name',
      'Alter',
    ]);
    expect(dataset.rows).toEqual([['Alice', '30']]);
  });

  it('erkennt Pipe als Trennzeichen', () => {
    const dataset = parseCsv('Name|Alter\nAlice|30');
    expect(dataset.columns.map((column) => column.name)).toEqual([
      'Name',
      'Alter',
    ]);
    expect(dataset.rows).toEqual([['Alice', '30']]);
  });

  it('behandelt eine rein numerische erste Zeile als Datenzeile', () => {
    const dataset = parseCsv('30,40\n1,2\n3,4');
    expect(dataset.columns.map((column) => column.name)).toEqual([
      'Spalte 1',
      'Spalte 2',
    ]);
    expect(dataset.columns.every((column) => column.type === 'number')).toBe(
      true,
    );
    expect(dataset.rows).toEqual([
      ['30', '40'],
      ['1', '2'],
      ['3', '4'],
    ]);
  });

  it('vergibt fortlaufende Spalten-Ids col-0, col-1, ...', () => {
    const dataset = parseCsv('a,b,c\n1,2,3');
    expect(dataset.columns.map((column) => column.id)).toEqual([
      'col-0',
      'col-1',
      'col-2',
    ]);
  });

  it('bestimmt eine Spalte als text, wenn nur ein Wert nicht-numerisch ist', () => {
    const dataset = parseCsv('Menge\n1\n2\nabc');
    expect(dataset.columns[0].type).toBe('text');
  });

  it('erkennt Dezimalzahlen als number', () => {
    const dataset = parseCsv('Wert\n1.5\n2.75');
    expect(dataset.columns[0].type).toBe('number');
  });

  it('ignoriert leere Werte bei der Typbestimmung', () => {
    const dataset = parseCsv('Wert\n\n1\n2');
    expect(dataset.columns[0].type).toBe('number');
  });

  it('behandelt eine Spalte ohne nicht-leere Werte als text', () => {
    const dataset = parseCsv('A,B\n1,');
    expect(dataset.columns[1].type).toBe('text');
  });

  it('wirft einen Fehler bei leerem Text', () => {
    expect(() => parseCsv('')).toThrow();
    expect(() => parseCsv('   ')).toThrow();
    expect(() => parseCsv('\n\n')).toThrow();
  });

  it('liefert einen Datensatz ohne Zeilen, wenn nur eine Kopfzeile vorhanden ist', () => {
    const dataset = parseCsv('Name,Alter');
    expect(dataset.columns).toHaveLength(2);
    expect(dataset.rows).toHaveLength(0);
  });

  it('verarbeitet CRLF-Zeilenumbrüche', () => {
    const dataset = parseCsv('Name,Alter\r\nAlice,30\r\nBob,25');
    expect(dataset.rows).toEqual([
      ['Alice', '30'],
      ['Bob', '25'],
    ]);
  });

  it('überspringt Leerzeilen', () => {
    const dataset = parseCsv('Name,Alter\n\nAlice,30\n\n');
    expect(dataset.rows).toEqual([['Alice', '30']]);
  });

  it('wählt das in der ersten Zeile häufigste Trennzeichen', () => {
    const dataset = parseCsv('A;B;C;D\n1;2;3;4');
    expect(dataset.columns).toHaveLength(4);
  });
});
