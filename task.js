import http from 'http';
import { UserController } from './controller/userController.js';
import { TaskController } from './controller/taskController.js';
import 'dotenv/config';
import { decodeUrl } from './utility/funcUtility.js';

console.log(process.env.PORT);
const userController  = new UserController();
const taskController=new TaskController();
const server = http.createServer(async(req, res) => {
    try {
        
        if (!req.url) {
            throw new TypeError('Request URL is undefined');
        }
        
        const { pathname, urlSegment } = decodeUrl(req);
    
        if (pathname === '/tasks') {
            new TaskController().controller(req, res);
            console.log(TaskController);
        } else if (pathname === '/users/login') {
            new UserController().controller(req, res);
            console.log(UserController);
        } else {
            res.statusCode = 404;
            res.end('Not Found');
        }
    } catch (error) {
        console.error(error);
        res.statusCode = 500;
        res.end('Internal Server Error');
    }
});

server.listen(process.env.PORT || 3000, () => {
    console.log(`Server is running on port ${process.env.PORT || 3000}`);
});
