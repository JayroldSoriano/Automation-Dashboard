import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../constants/Colors';
import { Layout } from '../constants/Layout';

const Row = ({ cells, header = false, style }) => {
  return (
    <View style={[styles.row, header ? styles.headerRow : null, style]}>
      {cells.map((cell, idx) => (
        <View key={idx} style={[styles.cell, idx === 0 && styles.firstCell]}>
          {typeof cell === 'string' || typeof cell === 'number' ? (
            <Text style={[styles.cellText, header ? styles.headerText : null]}>{cell}</Text>
          ) : (
            cell
          )}
        </View>
      ))}
    </View>
  );
};

const DataTable = ({ columns = [], data = [] }) => {
  return (
    <View style={styles.table}>
      <Row header cells={columns} />
      {data.map((row, idx) => (
        <Row key={idx} cells={row} style={idx % 2 === 1 ? styles.altRow : null} />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  table: {
    borderRadius: Layout.borderRadius.md,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Layout.spacing.sm,
    paddingHorizontal: Layout.spacing.sm,
  },
  headerRow: {
    backgroundColor: Colors.background,
  },
  altRow: {
    backgroundColor: '#FAFAFC',
  },
  cell: {
    flex: 1,
  },
  firstCell: {
    flex: 1.2,
  },
  cellText: {
    color: Colors.text,
    fontSize: 12,
  },
  headerText: {
    color: Colors.text,
    fontWeight: '600',
  },
});

export default DataTable;


