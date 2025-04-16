interface PostInterface {
    id: number;
    image: string | null;
    platform: string;
    message_error: string;
    post_date: string;
    status: string;
    text: string;
    url: string;
    image_url: string;
}

export default PostInterface;