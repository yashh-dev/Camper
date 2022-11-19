module.exports = function catchAsync(fun){
    return (req,res,next)=>{
        fun(req,res,next).catch(next);
    }
}