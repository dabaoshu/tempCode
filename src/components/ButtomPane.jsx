import React from 'react'
import styles from '../index.module.less'
const list1 = [
  { title: "X" },
  { title: "y" },
  { title: "z" },
  { title: "rotx" },
  { title: "roty" },
  { title: "rotz" },
  { title: "vx" },
  { title: "vy" },
  { title: "vz" },
  { title: "wx" },
  { title: "wy" },
  { title: "wz" },
]
const ListTable = ({ list }) => {
  return <div className={styles.listTable}>
    {
      list.map(o => {
        return <div key={o.title} className={styles.listItem}>
          <div className={styles.title}>
            {o.title}
          </div>
          <div className={styles.val}>
            
          </div>
        </div>
      })
    }

  </div>

}

export default function ButtomPane() {
  return (
    <div className={styles.ButtomPane}>
      实时状态
      <ListTable list={list1}></ListTable>
    </div>
  )
}
