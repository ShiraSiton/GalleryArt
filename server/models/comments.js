import DB from '../DB/runSql.js';

const queryAsync = async (sql, params) => {
  try {
    const [rows, fields] = await DB.execute(sql, params);
    return rows;
  } catch (err) {
    throw err;
  }
};

const commentsModel = {
  getById: async (id) => {
    return await queryAsync(`SELECT * FROM Comments WHERE id = ?`, [id]);
  },

  add: async (comment) => {
    try {
      const { userEmail, artWorkId, commentText } = comment;
      const [result] = await DB.execute(
        `INSERT INTO Comments (userEmail, artWorkId, commentText) VALUES (?, ?, ?)`,
        [userEmail, artWorkId, commentText]
      );
      return result;
    } catch (error) {
      console.error("❌ שגיאה ב-add:", error);
      throw error;
    }
  },

  update: async (id, updateFields) => {
    const fields = [];
    const values = [];

    for (const [key, value] of Object.entries(updateFields)) {
      fields.push(`${key} = ?`);
      values.push(value);
    }

    if (fields.length === 0) {
      throw new Error("No fields provided to update");
    }

    const sql = `UPDATE Comments SET ${fields.join(', ')} WHERE id = ?`;
    values.push(id);

    return await queryAsync(sql, values);
  },

  delete: async (id) => {
    try {
      const result = await DB.execute(
        `DELETE FROM Comments WHERE id = ?`,
        [id]
      );
      return result;
    } catch (error) {
      console.error("❌ שגיאה ב-delete:", error);
      throw error;
    }
  },
};

export default commentsModel;
