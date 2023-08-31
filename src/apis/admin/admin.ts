import {
  collection,
  query,
  orderBy,
  getDocs,
  addDoc,
} from 'firebase/firestore';
import { dbService } from '../firebase';

// 데이터 수정내역 업데이트
export const addEditDataHistory = async (inputValue: string) => {
  await addDoc(collection(dbService, 'edit-data-history'), {
    description: inputValue,
    updatedAt: Date.now(),
  });
};

// 데이터 수정내역 가져오기
export const getEditDataHistory = async () => {
  // edit-data-history 컬렉션 참조
  const editHistoryRef = collection(dbService, 'edit-data-history');
  // 오름차순으로 가져오기
  const q = query(editHistoryRef, orderBy('updatedAt', 'asc'));
  const querySnapshot = await getDocs(q);
  const historyList = querySnapshot.docs.map((list) => ({
    id: list.id,
    ...list.data(),
  }));

  return historyList;
};
