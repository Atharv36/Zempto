import multer from "multer";

const storage = multer.memoryStorage()//temporary

const upload = multer({storage:storage})

export default upload