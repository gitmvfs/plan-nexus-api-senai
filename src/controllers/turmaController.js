function verTodosCursos(sequelize){
    return new Promise(async(resolve, reject) => {
        
        try {
            sequelize.query("select * from todos_cursos order by nome")
            .then((r) => resolve(r[0]))
            .catch((e) => reject(e))
        } catch (error) {
            reject(error)
        }
    })
}

module.exports = { verTodosCursos }