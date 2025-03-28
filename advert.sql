PGDMP  5                    }            advert    17.4    17.2 E    }           0    0    ENCODING    ENCODING        SET client_encoding = 'UTF8';
                           false            ~           0    0 
   STDSTRINGS 
   STDSTRINGS     (   SET standard_conforming_strings = 'on';
                           false                       0    0 
   SEARCHPATH 
   SEARCHPATH     8   SELECT pg_catalog.set_config('search_path', '', false);
                           false            �           1262    25326    advert    DATABASE     l   CREATE DATABASE advert WITH TEMPLATE = template0 ENCODING = 'UTF8' LOCALE_PROVIDER = libc LOCALE = 'ru-RU';
    DROP DATABASE advert;
                     postgres    false            �            1255    25486 M   add_ad(integer, character varying, text, integer, numeric, character varying) 	   PROCEDURE     �  CREATE PROCEDURE public.add_ad(IN _user_id integer, IN _title character varying, IN _description text, IN _category_id integer, IN _price numeric, IN _location character varying, OUT _ad_id integer)
    LANGUAGE plpgsql
    AS $$
BEGIN
    INSERT INTO ads (user_id, title, description, category_id, price, location)
    VALUES (_user_id, _title, _description, _category_id, _price, _location)
    RETURNING id INTO _ad_id; -- Сохраняем ID в выходную переменную
END;
$$;
 �   DROP PROCEDURE public.add_ad(IN _user_id integer, IN _title character varying, IN _description text, IN _category_id integer, IN _price numeric, IN _location character varying, OUT _ad_id integer);
       public               postgres    false            �            1255    25474    notify_new_message()    FUNCTION     �  CREATE FUNCTION public.notify_new_message() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    -- Отправляем JSON как строку через CAST
    PERFORM pg_notify('new_message_channel', 
        json_build_object(
            'receiver_id', NEW.receiver_id,
            'sender_id', NEW.sender_id,
            'content', NEW.content
        )::TEXT
    );
    
    RETURN NEW;
END;
$$;
 +   DROP FUNCTION public.notify_new_message();
       public               postgres    false            �            1255    25473    update_timestamp()    FUNCTION     �   CREATE FUNCTION public.update_timestamp() RETURNS trigger
    LANGUAGE plpgsql
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;
 )   DROP FUNCTION public.update_timestamp();
       public               postgres    false            �            1259    25398 	   ad_images    TABLE     }   CREATE TABLE public.ad_images (
    id integer NOT NULL,
    ad_id integer,
    image_url character varying(255) NOT NULL
);
    DROP TABLE public.ad_images;
       public         heap r       postgres    false            �            1259    25397    ad_images_id_seq    SEQUENCE     �   CREATE SEQUENCE public.ad_images_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 '   DROP SEQUENCE public.ad_images_id_seq;
       public               postgres    false    224            �           0    0    ad_images_id_seq    SEQUENCE OWNED BY     E   ALTER SEQUENCE public.ad_images_id_seq OWNED BY public.ad_images.id;
          public               postgres    false    223            �            1259    25452    ad_views    TABLE     �   CREATE TABLE public.ad_views (
    id integer NOT NULL,
    ad_id integer,
    user_id integer,
    viewed_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.ad_views;
       public         heap r       postgres    false            �            1259    25451    ad_views_id_seq    SEQUENCE     �   CREATE SEQUENCE public.ad_views_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.ad_views_id_seq;
       public               postgres    false    229            �           0    0    ad_views_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.ad_views_id_seq OWNED BY public.ad_views.id;
          public               postgres    false    228            �            1259    25377    ads    TABLE     �  CREATE TABLE public.ads (
    id integer NOT NULL,
    user_id integer,
    title character varying(255) NOT NULL,
    description text NOT NULL,
    category_id integer,
    price numeric(10,2) NOT NULL,
    location character varying(255),
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    updated_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.ads;
       public         heap r       postgres    false            �            1259    25376 
   ads_id_seq    SEQUENCE     �   CREATE SEQUENCE public.ads_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 !   DROP SEQUENCE public.ads_id_seq;
       public               postgres    false    222            �           0    0 
   ads_id_seq    SEQUENCE OWNED BY     9   ALTER SEQUENCE public.ads_id_seq OWNED BY public.ads.id;
          public               postgres    false    221            �            1259    25368 
   categories    TABLE     f   CREATE TABLE public.categories (
    id integer NOT NULL,
    name character varying(100) NOT NULL
);
    DROP TABLE public.categories;
       public         heap r       postgres    false            �            1259    25367    categories_id_seq    SEQUENCE     �   CREATE SEQUENCE public.categories_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 (   DROP SEQUENCE public.categories_id_seq;
       public               postgres    false    220            �           0    0    categories_id_seq    SEQUENCE OWNED BY     G   ALTER SEQUENCE public.categories_id_seq OWNED BY public.categories.id;
          public               postgres    false    219            �            1259    25435 	   favorites    TABLE     �   CREATE TABLE public.favorites (
    user_id integer NOT NULL,
    ad_id integer NOT NULL,
    added_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.favorites;
       public         heap r       postgres    false            �            1259    25410    messages    TABLE     �   CREATE TABLE public.messages (
    id integer NOT NULL,
    sender_id integer,
    receiver_id integer,
    ad_id integer,
    content text NOT NULL,
    sent_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
    is_read boolean DEFAULT false
);
    DROP TABLE public.messages;
       public         heap r       postgres    false            �            1259    25356    users    TABLE       CREATE TABLE public.users (
    id integer NOT NULL,
    username character varying(50) NOT NULL,
    email character varying(100) NOT NULL,
    password character varying(255) NOT NULL,
    created_at timestamp without time zone DEFAULT CURRENT_TIMESTAMP
);
    DROP TABLE public.users;
       public         heap r       postgres    false            �            1259    25482    latest_messages    VIEW     z  CREATE VIEW public.latest_messages AS
 SELECT m.id,
    m.sender_id,
    sender.username AS sender_name,
    m.receiver_id,
    receiver.username AS receiver_name,
    m.content,
    m.sent_at
   FROM ((public.messages m
     JOIN public.users sender ON ((m.sender_id = sender.id)))
     JOIN public.users receiver ON ((m.receiver_id = receiver.id)))
  ORDER BY m.sent_at DESC;
 "   DROP VIEW public.latest_messages;
       public       v       postgres    false    226    226    226    226    226    218    218            �            1259    25409    messages_id_seq    SEQUENCE     �   CREATE SEQUENCE public.messages_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 &   DROP SEQUENCE public.messages_id_seq;
       public               postgres    false    226            �           0    0    messages_id_seq    SEQUENCE OWNED BY     C   ALTER SEQUENCE public.messages_id_seq OWNED BY public.messages.id;
          public               postgres    false    225            �            1259    25477    popular_ads    VIEW     =  CREATE VIEW public.popular_ads AS
 SELECT ads.id,
    ads.title,
    ads.price,
    COALESCE(count(ad_views.id), (0)::bigint) AS views
   FROM (public.ads
     LEFT JOIN public.ad_views ON ((ads.id = ad_views.ad_id)))
  GROUP BY ads.id, ads.title, ads.price
  ORDER BY COALESCE(count(ad_views.id), (0)::bigint) DESC;
    DROP VIEW public.popular_ads;
       public       v       postgres    false    222    222    229    229    222            �            1259    25355    users_id_seq    SEQUENCE     �   CREATE SEQUENCE public.users_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;
 #   DROP SEQUENCE public.users_id_seq;
       public               postgres    false    218            �           0    0    users_id_seq    SEQUENCE OWNED BY     =   ALTER SEQUENCE public.users_id_seq OWNED BY public.users.id;
          public               postgres    false    217            �           2604    25401    ad_images id    DEFAULT     l   ALTER TABLE ONLY public.ad_images ALTER COLUMN id SET DEFAULT nextval('public.ad_images_id_seq'::regclass);
 ;   ALTER TABLE public.ad_images ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    223    224    224            �           2604    25455    ad_views id    DEFAULT     j   ALTER TABLE ONLY public.ad_views ALTER COLUMN id SET DEFAULT nextval('public.ad_views_id_seq'::regclass);
 :   ALTER TABLE public.ad_views ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    228    229    229            �           2604    25380    ads id    DEFAULT     `   ALTER TABLE ONLY public.ads ALTER COLUMN id SET DEFAULT nextval('public.ads_id_seq'::regclass);
 5   ALTER TABLE public.ads ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    221    222    222            �           2604    25371    categories id    DEFAULT     n   ALTER TABLE ONLY public.categories ALTER COLUMN id SET DEFAULT nextval('public.categories_id_seq'::regclass);
 <   ALTER TABLE public.categories ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    220    219    220            �           2604    25413    messages id    DEFAULT     j   ALTER TABLE ONLY public.messages ALTER COLUMN id SET DEFAULT nextval('public.messages_id_seq'::regclass);
 :   ALTER TABLE public.messages ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    226    225    226            �           2604    25359    users id    DEFAULT     d   ALTER TABLE ONLY public.users ALTER COLUMN id SET DEFAULT nextval('public.users_id_seq'::regclass);
 7   ALTER TABLE public.users ALTER COLUMN id DROP DEFAULT;
       public               postgres    false    217    218    218            u          0    25398 	   ad_images 
   TABLE DATA           9   COPY public.ad_images (id, ad_id, image_url) FROM stdin;
    public               postgres    false    224   �V       z          0    25452    ad_views 
   TABLE DATA           A   COPY public.ad_views (id, ad_id, user_id, viewed_at) FROM stdin;
    public               postgres    false    229   �W       s          0    25377    ads 
   TABLE DATA           t   COPY public.ads (id, user_id, title, description, category_id, price, location, created_at, updated_at) FROM stdin;
    public               postgres    false    222   	X       q          0    25368 
   categories 
   TABLE DATA           .   COPY public.categories (id, name) FROM stdin;
    public               postgres    false    220   Y       x          0    25435 	   favorites 
   TABLE DATA           =   COPY public.favorites (user_id, ad_id, added_at) FROM stdin;
    public               postgres    false    227   �Y       w          0    25410    messages 
   TABLE DATA           `   COPY public.messages (id, sender_id, receiver_id, ad_id, content, sent_at, is_read) FROM stdin;
    public               postgres    false    226   �Y       o          0    25356    users 
   TABLE DATA           J   COPY public.users (id, username, email, password, created_at) FROM stdin;
    public               postgres    false    218   �Z       �           0    0    ad_images_id_seq    SEQUENCE SET     >   SELECT pg_catalog.setval('public.ad_images_id_seq', 4, true);
          public               postgres    false    223            �           0    0    ad_views_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.ad_views_id_seq', 4, true);
          public               postgres    false    228            �           0    0 
   ads_id_seq    SEQUENCE SET     8   SELECT pg_catalog.setval('public.ads_id_seq', 3, true);
          public               postgres    false    221            �           0    0    categories_id_seq    SEQUENCE SET     ?   SELECT pg_catalog.setval('public.categories_id_seq', 5, true);
          public               postgres    false    219            �           0    0    messages_id_seq    SEQUENCE SET     =   SELECT pg_catalog.setval('public.messages_id_seq', 2, true);
          public               postgres    false    225            �           0    0    users_id_seq    SEQUENCE SET     :   SELECT pg_catalog.setval('public.users_id_seq', 3, true);
          public               postgres    false    217            �           2606    25403    ad_images ad_images_pkey 
   CONSTRAINT     V   ALTER TABLE ONLY public.ad_images
    ADD CONSTRAINT ad_images_pkey PRIMARY KEY (id);
 B   ALTER TABLE ONLY public.ad_images DROP CONSTRAINT ad_images_pkey;
       public                 postgres    false    224            �           2606    25458    ad_views ad_views_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.ad_views
    ADD CONSTRAINT ad_views_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.ad_views DROP CONSTRAINT ad_views_pkey;
       public                 postgres    false    229            �           2606    25386    ads ads_pkey 
   CONSTRAINT     J   ALTER TABLE ONLY public.ads
    ADD CONSTRAINT ads_pkey PRIMARY KEY (id);
 6   ALTER TABLE ONLY public.ads DROP CONSTRAINT ads_pkey;
       public                 postgres    false    222            �           2606    25375    categories categories_name_key 
   CONSTRAINT     Y   ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_name_key UNIQUE (name);
 H   ALTER TABLE ONLY public.categories DROP CONSTRAINT categories_name_key;
       public                 postgres    false    220            �           2606    25373    categories categories_pkey 
   CONSTRAINT     X   ALTER TABLE ONLY public.categories
    ADD CONSTRAINT categories_pkey PRIMARY KEY (id);
 D   ALTER TABLE ONLY public.categories DROP CONSTRAINT categories_pkey;
       public                 postgres    false    220            �           2606    25440    favorites favorites_pkey 
   CONSTRAINT     b   ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_pkey PRIMARY KEY (user_id, ad_id);
 B   ALTER TABLE ONLY public.favorites DROP CONSTRAINT favorites_pkey;
       public                 postgres    false    227    227            �           2606    25419    messages messages_pkey 
   CONSTRAINT     T   ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_pkey PRIMARY KEY (id);
 @   ALTER TABLE ONLY public.messages DROP CONSTRAINT messages_pkey;
       public                 postgres    false    226            �           2606    25366    users users_email_key 
   CONSTRAINT     Q   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_email_key UNIQUE (email);
 ?   ALTER TABLE ONLY public.users DROP CONSTRAINT users_email_key;
       public                 postgres    false    218            �           2606    25362    users users_pkey 
   CONSTRAINT     N   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);
 :   ALTER TABLE ONLY public.users DROP CONSTRAINT users_pkey;
       public                 postgres    false    218            �           2606    25364    users users_username_key 
   CONSTRAINT     W   ALTER TABLE ONLY public.users
    ADD CONSTRAINT users_username_key UNIQUE (username);
 B   ALTER TABLE ONLY public.users DROP CONSTRAINT users_username_key;
       public                 postgres    false    218            �           2620    25475    ads ad_update_trigger    TRIGGER     v   CREATE TRIGGER ad_update_trigger BEFORE UPDATE ON public.ads FOR EACH ROW EXECUTE FUNCTION public.update_timestamp();
 .   DROP TRIGGER ad_update_trigger ON public.ads;
       public               postgres    false    222    232            �           2620    25476    messages new_message_trigger    TRIGGER     ~   CREATE TRIGGER new_message_trigger AFTER INSERT ON public.messages FOR EACH ROW EXECUTE FUNCTION public.notify_new_message();
 5   DROP TRIGGER new_message_trigger ON public.messages;
       public               postgres    false    226    233            �           2606    25404    ad_images ad_images_ad_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.ad_images
    ADD CONSTRAINT ad_images_ad_id_fkey FOREIGN KEY (ad_id) REFERENCES public.ads(id) ON DELETE CASCADE;
 H   ALTER TABLE ONLY public.ad_images DROP CONSTRAINT ad_images_ad_id_fkey;
       public               postgres    false    222    4806    224            �           2606    25459    ad_views ad_views_ad_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.ad_views
    ADD CONSTRAINT ad_views_ad_id_fkey FOREIGN KEY (ad_id) REFERENCES public.ads(id) ON DELETE CASCADE;
 F   ALTER TABLE ONLY public.ad_views DROP CONSTRAINT ad_views_ad_id_fkey;
       public               postgres    false    222    4806    229            �           2606    25464    ad_views ad_views_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.ad_views
    ADD CONSTRAINT ad_views_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE SET NULL;
 H   ALTER TABLE ONLY public.ad_views DROP CONSTRAINT ad_views_user_id_fkey;
       public               postgres    false    218    229    4798            �           2606    25392    ads ads_category_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.ads
    ADD CONSTRAINT ads_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;
 B   ALTER TABLE ONLY public.ads DROP CONSTRAINT ads_category_id_fkey;
       public               postgres    false    222    4804    220            �           2606    25387    ads ads_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.ads
    ADD CONSTRAINT ads_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 >   ALTER TABLE ONLY public.ads DROP CONSTRAINT ads_user_id_fkey;
       public               postgres    false    4798    222    218            �           2606    25446    favorites favorites_ad_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_ad_id_fkey FOREIGN KEY (ad_id) REFERENCES public.ads(id) ON DELETE CASCADE;
 H   ALTER TABLE ONLY public.favorites DROP CONSTRAINT favorites_ad_id_fkey;
       public               postgres    false    227    222    4806            �           2606    25441     favorites favorites_user_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.favorites
    ADD CONSTRAINT favorites_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;
 J   ALTER TABLE ONLY public.favorites DROP CONSTRAINT favorites_user_id_fkey;
       public               postgres    false    227    4798    218            �           2606    25430    messages messages_ad_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_ad_id_fkey FOREIGN KEY (ad_id) REFERENCES public.ads(id) ON DELETE CASCADE;
 F   ALTER TABLE ONLY public.messages DROP CONSTRAINT messages_ad_id_fkey;
       public               postgres    false    4806    226    222            �           2606    25425 "   messages messages_receiver_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_receiver_id_fkey FOREIGN KEY (receiver_id) REFERENCES public.users(id) ON DELETE CASCADE;
 L   ALTER TABLE ONLY public.messages DROP CONSTRAINT messages_receiver_id_fkey;
       public               postgres    false    218    4798    226            �           2606    25420     messages messages_sender_id_fkey    FK CONSTRAINT     �   ALTER TABLE ONLY public.messages
    ADD CONSTRAINT messages_sender_id_fkey FOREIGN KEY (sender_id) REFERENCES public.users(id) ON DELETE CASCADE;
 J   ALTER TABLE ONLY public.messages DROP CONSTRAINT messages_sender_id_fkey;
       public               postgres    false    226    4798    218            u   �   x�u��N� E�����5.���k��@�a�_ogL&n���sE'��9�WD�$���P�mAO�]�J��[�k8hiu�tUR���#/��#9�aII�o��BȔM��-�Q�X7r�y߫	|�+�Z8&��L�W�|m�TL���.Ü"���rH�+�Q<�(��Pcg[���H����S!E��ZSN8�{�Q��_:���Nۿy�u�I������������a�rC      z   <   x�3�4�4�4202�50�52S02�2 "#=KK3sS.#��1y����& �x�c���� >6      s      x���]n�0���S��G��g�04����PQoQSH|��1& �Ҿ`ٖמ����J62���J2�5����GS�|X�R��(�LP���q����:�����5�_�te�u��b���<N����'��Kd�����&qI��k�G�+��_������h��&eɟը鞺+�'�[$��AEY�ܭ�����T\��u�J�6`��@E�dE�7!�LC��YT�����K����_���#��$��9C      q   g   x����Pk{� �&�h)X�4�#%���?�y�<
K���#����Es���6z/��)Z�Y��Y�2^
�MWw�����k�!Q�f�z5�ѰG�Wo�����MD�      x   3   x�3�4�4202�50�52S02�2 "#=KK3sS.#Nc<�Ɯ�xdc���� ,��      w   �   x�}M��@=�V�Y�����x�>�\LLl	K���#���d޼Ob�$,<1h��VZs6�������������w���K`�@وp4�%�|I��<[����9[1)���Aŋv7̎ҀE[�|�X���V�5�g��;�`"��t���?�
i�      o   H   x�3�,-N-2��鹉�9z���PQ##S]c]#3#+ 2ҳ�437�2���$�3���$����� 0H-     