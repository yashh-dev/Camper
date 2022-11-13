const express = require('express');
const app = express();
const port = 3000;
app.get('/',(req,res)=>{
	res.send('Hi your here');
}
)
app.listen(port,()=>{
	console.log(`Serving on ${port}....`);
})

