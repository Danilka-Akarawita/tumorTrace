import os
import pandas as pd
from sklearn.model_selection import train_test_split
from tensorflow.keras.preprocessing.image import ImageDataGenerator

def load_data(tr_path, ts_path):
    def create_df(path):
        classes, class_paths = zip(*[(label, os.path.join(path, label, image))
                                     for label in os.listdir(path) if os.path.isdir(os.path.join(path, label))
                                     for image in os.listdir(os.path.join(path, label))])
        return pd.DataFrame({'Class Path': class_paths, 'Class': classes})

    train_data = create_df(tr_path)
    test_data = create_df(ts_path)
    return train_data, test_data

def preprocess_data(train_data, test_data, img_size, batch_size):
    valid_data, test_data = train_test_split(test_data, train_size=0.5, random_state=42, stratify=test_data['Class'])
    
    data_prep = ImageDataGenerator(rescale=1/255, brightness_range=(0.8, 1.2))
    test_data_prep = ImageDataGenerator(rescale=1/255)

    train_prep_data = data_prep.flow_from_dataframe(train_data, x_col='Class Path', y_col='Class', batch_size=batch_size, target_size=img_size)
    valid_prep_data = data_prep.flow_from_dataframe(valid_data, x_col='Class Path', y_col='Class', batch_size=batch_size, target_size=img_size)
    test_prep_data = test_data_prep.flow_from_dataframe(test_data, x_col='Class Path', y_col='Class', batch_size=16, target_size=img_size, shuffle=False)

    return train_prep_data, valid_prep_data, test_prep_data

#for vgg16 model
def preprocess_data_vgg(train_data, valid_data, img_size, batch_size):
    data_prep = ImageDataGenerator(rescale=1/255, brightness_range=(0.8, 1.2))

    train_prep_data_vgg = data_prep.flow_from_dataframe(train_data, x_col='Class Path', y_col='Class', batch_size=batch_size, target_size=img_size)
    valid_prep_data_vgg = data_prep.flow_from_dataframe(valid_data, x_col='Class Path', y_col='Class', batch_size=batch_size, target_size=img_size)

    return train_prep_data_vgg, valid_prep_data_vgg