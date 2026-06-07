import commentsModel from '../models/comments.js';

function validateCommentsInput(data, { isUpdate = false } = {}) {
  const errors = [];

  if ("userEmail" in data) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (typeof data.userEmail !== "string" || !emailRegex.test(data.userEmail)) {
      errors.push("אימייל לא תקין");
    }
  } else if (!isUpdate) {
    errors.push("שדה אימייל חסר");
  }

  if ("artWorkId" in data) {
    if (!Number.isInteger(data.artWorkId) || data.artWorkId <= 0) {
      errors.push("מזהה יצירה לא תקין");
    }
  } else if (!isUpdate) {
    errors.push("שדה מספר יצירה חסר");
  }

  if ("commentText" in data) {
    if (typeof data.commentText !== "string" || data.commentText.trim().length === 0) {
      errors.push("התגובה לא יכולה להיות ריקה");
    } else if (data.commentText.length > 1000) {
      errors.push("התגובה חורגת מהמגבלה של 1000 תווים");
    }
  } else if (!isUpdate) {
    errors.push("שדה תוכן תגובה חסר");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

const commentsController = {
  add: async (req, res) => {
    const result = validateCommentsInput(req.body);
    if (!result.valid) {
      return res.status(400).json({ errors: result.errors });
    }

    const { userEmail, artWorkId, commentText } = req.body;

    try {
      const comment = { userEmail, artWorkId, commentText };
      const insertResult = await commentsModel.add(comment);

      res.status(201).json({
        message: "Comment added successfully",
        comment,
      });
    } catch (error) {
      console.error("❌ Error adding comment:", error);
      res.status(500).json({ error: "Database Error" });
    }
  },

  getById: async (req, res) => {
    const { id } = req.params;

    if (!Number.isInteger(Number(id))) {
      return res.status(400).json({ error: "Invalid comment ID" });
    }

    try {
      const comment = await commentsModel.getById(Number(id));
      if (!comment) {
        return res.status(404).json({ error: "Comment not found" });
      }

      res.json(comment);
    } catch (err) {
      console.error("❌ Error fetching comment:", err);
      res.status(500).json({ error: "Database Error" });
    }
  },

  update: async (req, res) => {
    const { id } = req.params;
    const updateFields = req.body;

    const result = validateCommentsInput(updateFields, { isUpdate: true });
    if (!result.valid) {
      return res.status(400).json({ errors: result.errors });
    }

    const filteredFields = Object.fromEntries(
      Object.entries(updateFields).filter(([_, value]) => value !== undefined)
    );

    if (Object.keys(filteredFields).length === 0) {
      return res.status(400).json({ error: "No fields provided to update" });
    }

    try {
      const updateResult = await commentsModel.update(Number(id), filteredFields);
      if (!updateResult || updateResult.affectedRows === 0) {
        return res.status(404).json({ error: "Comment not found" });
      }

      res.json({ message: "Comment updated successfully" });
    } catch (error) {
      console.error("❌ Error updating comment:", error);
      res.status(500).json({ error: "Database Error" });
    }
  },

  delete: async (req, res) => {
    const { id } = req.params;

    try {
      const result = await commentsModel.delete(Number(id));

      if (!result || result.affectedRows === 0) {
        return res.status(404).json({ error: "התגובה לא נמצאה" });
      }

      res.json({ message: "התגובה נמחקה בהצלחה" });
    } catch (error) {
      console.error("❌ שגיאה במחיקת התגובה:", error);
      res.status(500).json({ error: "שגיאה בשרת בעת מחיקת התגובה" });
    }
  }
};

export default commentsController;
