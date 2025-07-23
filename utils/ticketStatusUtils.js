const getReleaseStatusDisplay = (releaseStatus) => {
  const status = Number(releaseStatus);

  if (status === 1) {
    return {
      displayText: "Released",
      className:
        "bg-green-100 text-green-700 px-2 py-1 text-xs rounded font-semibold",
    };
  }
  return {
    displayText: "Not Released",
    className:
      "bg-red-100 text-red-700 px-2 py-1 text-xs rounded font-semibold",
  };
};

export { getReleaseStatusDisplay };
