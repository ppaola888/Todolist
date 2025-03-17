const cursorPagination = (req, res, next) => {
  const { cursor, limit, direction } = req.query;

  console.log('Cursor from query:', cursor);
  console.log('Type of cursor:', typeof cursor);

  const parsedLimit = parseInt(limit, 10) || 10;
  const parsedDirection = direction === 'prev' ? 'prev' : 'next';

  req.pagination = {
    cursor: cursor || null,
    limit: parsedLimit,
    direction: parsedDirection,
  };

  console.log('Pagination parameters:', req.pagination);
  next();
};

export default cursorPagination;
