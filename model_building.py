from tensorflow.keras.layers import Input, Dense, Flatten, Dropout
from tensorflow.keras.models import Model, Sequential
from tensorflow.keras.optimizers import Adamax, RMSprop
from tensorflow.keras.metrics import Precision, Recall
from tensorflow.keras.applications import VGG16

 #transfer learning
def build_xception_model(img_shape):
    base_model = tf.keras.applications.Xception(include_top=False, weights="imagenet", input_shape=img_shape, pooling='max')
    base_model.trainable = False

    inputs = Input(shape=img_shape)
    x = base_model(inputs)
    x = Flatten()(x)
    x = Dropout(rate=0.3)(x)
    x = Dense(128, activation='relu')(x)
    x = Dropout(rate=0.25)(x)
    x = Dense(4, activation='softmax')(x)

    model = Model(inputs, x)
    model.compile(Adamax(learning_rate=0.001), loss='categorical_crossentropy', metrics=['accuracy', Precision(), Recall()])
    return model

#vgg16 model building
def build_vgg16_model(img_shape):
    vgg_base = VGG16(weights='imagenet', include_top=False, input_shape=img_shape)
    for layer in vgg_base.layers:
        layer.trainable = False

    vgg_model = models.Sequential()
    vgg_model.add(vgg_base)
    vgg_model.add(layers.Flatten())
    vgg_model.add(layers.BatchNormalization())
    vgg_model.add(layers.Dense(128, activation='relu'))
    vgg_model.add(layers.Dropout(0.5))
    vgg_model.add(layers.BatchNormalization())
    vgg_model.add(layers.Dense(64, activation='relu'))
    vgg_model.add(layers.Dropout(0.5))
    vgg_model.add(layers.Dense(4, activation='softmax'))

    vgg_model.compile(optimizer=RMSprop(learning_rate=1e-4), loss='categorical_crossentropy', metrics=['acc'])
    return vgg_model