import { StyleSheet } from "@react-pdf/renderer";

export const styles = StyleSheet.create({
  page: {
    flexDirection: "column",
    backgroundColor: "#ffffff",
    padding: 12,
    fontFamily: "Helvetica",
  },
  headerContainer: {
    backgroundColor: "#00008B", 
    paddingVertical: 6, // Further reduced
    marginBottom: 10, // Further reduced
    alignItems: "center",
    justifyContent: "center",
  },
  companyName: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#ffffff",
    marginBottom: 2, // Further reduced
  },
  tagline: {
    fontSize: 14,
    color: "#e0e0e0",
    textAlign: "center",
  },
  alertBox: {
    border: "1 solid #ff0000", 
    backgroundColor: "#ffe0e0", 
    padding: 8,
    marginBottom: 15,
    fontSize: 9,
    color: "#ff0000",
    textAlign: "center",
  },
  mainInfoGrid: {
    flexDirection: "row",
    border: "1 solid #e0e0e0",
    marginBottom: 15,
  },
  mainInfoCell: {
    padding: 8,
    borderRight: "1 solid #e0e0e0",
    flex: 1,
    justifyContent: "center",
  },
  mainInfoCellLast: {
    padding: 8,
    flex: 1,
    justifyContent: "center",
    borderRight: "none",
  },
  mainInfoLabel: {
    fontSize: 8,
    color: "#555555",
    marginBottom: 2,
  },
  mainInfoValue: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#333333",
  },
  section: {
    border: "1 solid #e0e0e0",
    marginBottom: 4, // Further reduced
  },
  sectionTitle: {
    backgroundColor: "#e0e0e0",
    padding: 4, // Further reduced
    fontSize: 12,
    fontWeight: "bold",
    color: "#333333",
  },
  sectionContent: {
    padding: 4, // Further reduced
  },
  paragraph: {
    fontSize: 9.5,
    marginBottom: 1, // Further reduced
    lineHeight: 1.3, // Slightly reduced
  },
  passengerInfoRow: {
    flexDirection: "row",
    borderBottom: "0.5 solid #eeeeee",
    paddingVertical: 1, // Further reduced
  },
  passengerName: {
    flex: 0.6,
    fontSize: 9.5,
    fontWeight: "bold",
    color: "#333333",
  },
  passengerDetails: {
    flex: 0.4,
    fontSize: 9,
    color: "#555555",
  },
  table: {
    display: "table",
    width: "100%",
    marginBottom: 0,
    borderCollapse: "collapse",
  },
  tableRow: {
    flexDirection: "row",
  },
  tableColHeader: {
    width: "25%",
    borderStyle: "solid",
    borderColor: "#000000",
    borderWidth: 1,
    borderBottomWidth: 2,
    backgroundColor: "#f0f0f0",
    padding: 2, // Further reduced
    textAlign: "center",
  },
  tableCol: {
    width: "25%",
    borderStyle: "solid",
    borderColor: "#e0e0e0",
    borderWidth: 1,
    padding: 2, // Further reduced
    textAlign: "center",
  },
  tableCellHeader: {
    fontSize: 9,
    fontWeight: "bold",
    color: "#333333",
  },
  tableCell: {
    fontSize: 9,
    color: "#444444",
  },
  contactInfo: {
    fontSize: 9.5,
    marginBottom: 1, // Further reduced
    color: "#333333",
  },
  termsBox: {
    border: "1 solid #e0e0e0",
    padding: 4, // Further reduced
    marginBottom: 4, // Further reduced
  },
  termsTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 2, // Further reduced
    color: "#333333",
  },
  termsListItem: {
    fontSize: 8.5,
    marginBottom: 1, // Further reduced
    marginLeft: 10,
    marginRight: 5,
    lineHeight: 1.2, // Slightly reduced
  },
  importantInfoBox: {
    border: "1 solid #e0e0e0",
    padding: 4, // Further reduced
  },
  importantInfoTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 2, // Further reduced
    color: "#333333",
  },
  importantInfoListItem: {
    fontSize: 8.5,
    marginBottom: 1, // Further reduced
    marginLeft: 10,
    marginRight: 5,
    lineHeight: 1.2, // Slightly reduced
  },
  footer: {
    position: "absolute",
    bottom: 6, // Further reduced
    left: 6, // Further reduced
    right: 6, // Further reduced
    textAlign: "center",
    fontSize: 7.5,
    color: "#777777",
  },
}); 